const express = require("express");
const pool = require("../../config/database.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

/*
    password: 사용자가 입력한 비밀번호
    salt: 데이터베이스에 있는 salt
    passwordKey: 데이터베이스에 있는 비밀번호
    userData: 데이터베이스에 있는 모든 유저 정보
*/
function checkPw(password, userData) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      userData.user_salt,
      127312,
      64,
      "sha512",
      (err, key) => {
        if (err) {
          reject(err);
        } else {
          if (key.toString("base64") === userData.user_password) {
            resolve(userData);
          } else {
            reject(new Error("비밀번호가 맞지 않습니다."));
          }
        }
      }
    );
  });
}

function Login(request, response, next) {
  const text = `SELECT * FROM users WHERE user_email = $1`;
  const values = [request.body.userEmail];

  pool
    .query(text, values)
    .then((res) => {
      if (!res.rows[0]) {
        throw Error("이메일이 맞지 않습니다.");
      }

      return checkPw(request.body.userPassword, res.rows[0]);
    })
    .then((data) => {
      request.userData = data;
      next();
    })
    .catch((e) => {
      response.json({
        success: false,
        message: e.message,
      });
    });
}

function createToken(request, response) {
  const text = `SELECT * FROM users WHERE user_id = $1`;
  const values = [request.userData.user_id];

  pool.query(text, values).then((res) => {
    const token = jwt.sign(
      {
        userId: request.userData.user_id,
        email: request.userData.user_email,
      },
      "mycondition",
      {
        expiresIn: "365d",
        issuer: "Sumin",
      }
    );

    response.json({
      success: true,
      userToken: token,
      userName: res.rows[0].user_name,
      userAvatar: res.rows[0].avatar_url,
      userCode: res.rows[0].user_code,
    });
  });
}

router.post("/", Login);
router.use("/", createToken);

module.exports = router;
