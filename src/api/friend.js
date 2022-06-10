const express = require("express");
const router = express.Router();
const pool = require("../../config/database.js");
const verifyToken = require("../middleware/verifyToken");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const getTimeNow = () => moment().format("YYYY-MM-DDTHH:mm:ss");

function addFriend(request, response) {
  const userData = request.userTokenInfo;
  const text = `SELECT user_id FROM users WHERE user_code = $1`;
  const text2 = `SELECT id FROM friends WHERE user_from = $1 and user_to = $2;`;
  const text3 = `INSERT INTO friends (user_from, user_to, create_date) VALUES ($1, $2, $3)`;

  pool
    .query(text, [request.body.userCode])
    .then((res) => {
      const values = {
        userFrom: userData.userId,
        userTo: res.rows[0].user_id,
      };
      request.friendInfo = { ...values };
    })
    .then(() => {
      if (request.friendInfo.userFrom === request.friendInfo.userTo) {
        throw Error("자신은 친구 추가를 할 수 없습니다.");
      }
      return pool.query(text2, [
        request.friendInfo.userFrom,
        request.friendInfo.userTo,
      ]);
    })
    .then((res) => {
      if (res.rows[0]) throw Error("이미 친구가 되었습니다.");
      const call1 = pool.query(text3, [
        request.friendInfo.userFrom,
        request.friendInfo.userTo,
        getTimeNow(),
      ]);
      const call2 = pool.query(text3, [
        request.friendInfo.userTo,
        request.friendInfo.userFrom,
        getTimeNow(),
      ]);
      return Promise.all([call1, call2]);
    })
    .then(() => {
      response.json({
        success: true,
        message: "친구를 추가했습니다.",
      });
    })
    .catch((e) => {
      console.log(e);
      response.json({
        success: false,
        message: e.message,
      });
    });
}

function getFriends(request, response) {
  const userData = request.userTokenInfo;
  const text = `
        SELECT user_id, user_name, user_code, condition, update_date, users.avatar_url
        FROM (
            SELECT * FROM friends WHERE user_from = $1
        ) as select_user
        INNER JOIN users ON users.user_id = select_user.user_to;
    `;
  const values = [userData.userId];

  pool.query(text, values).then((res) => {
    response.json({
      success: true,
      data: res.rows,
    });
  });
}

function deleteFriend(request, response) {
  const userData = request.userTokenInfo;
  const text = `DELETE FROM friends WHERE user_from = $1 and user_to = $2`;
  const values = [userData.userId, request.body.userTo];

  pool.query(text, values).then(() => {
    pool.query(text, [request.body.userTo, userData.userId]);
    response.json({
      success: true,
      message: "친구가 삭제되었습니다.",
    });
  });
}

router.use("/", verifyToken);
router.post("/", addFriend);
router.get("/", getFriends);
router.delete("/", deleteFriend);

module.exports = router;
