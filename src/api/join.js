const express = require("express");
const pool = require("../../config/database");
const crypto = require("crypto");
const router = express.Router();
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const getTimeNow = () => moment().format("YYYY-MM-DDTHH:mm:ss");

function createPw(password) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        crypto.pbkdf2(
          password,
          buf.toString("base64"),
          127312,
          64,
          "sha512",
          (err, key) => {
            if (err) {
              console.error(err);
            } else {
              const result = {
                salt: buf.toString("base64"),
                key: key.toString("base64"),
              };
              resolve(result);
            }
          }
        );
      }
    });
  });
}

function Join(request, response) {
  const rule =
    !request.body.userPassword ||
    !request.body.userName ||
    !request.body.userEmail;
  if (rule) {
    response.status(200).json({
      success: false,
      message: "올바른 형식이 아닙니다.",
    });
  }
  createPw(request.body.userPassword).then((keySet) => {
    const text = `
    INSERT INTO users (
      user_name,
      user_email,
      user_password,
      user_salt,
      user_code,
      condition,
      avatar_url,
      create_date,
      update_date
    ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9)
`;
    const values = [
      request.body.userName,
      request.body.userEmail,
      keySet.key,
      keySet.salt,
      uuidv4(),
      "앱 둘러보는",
      "https://res.cloudinary.com/dvxc4t4yt/image/upload/v1654587329/condition-app/default_eqds9t.png",
      getTimeNow(),
      getTimeNow(),
    ];

    pool
      .query(text, values)
      .then(() => {
        response.json({
          success: true,
          message: "회원가입이 완료되었습니다.",
        });
      })
      .catch((e) => {
        console.error(e.stack);
        response.status(202).json({
          success: false,
          message: "회원가입이 완료되지 않았습니다.",
        });
      });
  });
}

router.post("/", Join);

module.exports = router;
