const express = require("express");
const router = express.Router();
const pool = require("../../config/database.js");
const verifyToken = require("../middleware/verifyToken");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const getTimeNow = () => moment().format("YYYY-MM-DDTHH:mm:ss");

function conditionUpdate(request, response) {
  const userData = request.userTokenInfo;
  const text = `UPDATE users SET condition = $1, update_date = $2 WHERE user_id = $3`;
  const text2 = `INSERT INTO condition_log (user_from, condition, create_date) VALUES ($1, $2, $3)`;
  const values = [request.body.myCondition, getTimeNow(), userData.userId];
  const values2 = [userData.userId, request.body.myCondition, getTimeNow()];

  const call1 = pool.query(text, values);
  const call2 = pool.query(text2, values2);

  Promise.all([call1, call2]).then(() => {
    response.json({
      success: true,
      message: "나의 상태가 업데이트 되었습니다.",
    });
  });
}

function getCondition(request, response) {
  const userData = request.userTokenInfo;
  const getFriendsIdQuery = `
    SELECT user_id
    FROM (
        SELECT * FROM friends WHERE user_from = $1
    ) as select_user
    INNER JOIN users ON users.user_id = select_user.user_to;
  `;
  const getConditionQuery = `
    SELECT users.user_name, condition_select.condition, users.avatar_url, condition_select.create_date
    FROM (SELECT * FROM condition_log WHERE user_from = $1) as condition_select
    INNER JOIN users ON users.user_id = condition_select.user_from;  
  `;

  pool
    .query(getFriendsIdQuery, [userData.userId])
    .then((res) => {
      // 나의 친구 데이터를 가져와서 친구들 user_id만 배열에 저장
      const friendsList = []; //친구들 user_id
      for (const item of res.rows) {
        friendsList.push(item.user_id);
      }
      return friendsList;
    })
    .then((list) => {
      // 친구들 user_id를 통해 logs 데이터 불러옴
      const logList = [];
      for (const item of list) {
        logList.push(pool.query(getConditionQuery, [item]));
      }
      return logList;
    })
    .then((logList) => {
      // 나의 logs 데이터도 불러옴
      const myLogs = pool.query(getConditionQuery, [userData.userId]);
      return Promise.all([myLogs, ...logList]);
    })
    .then((res) => {
      //모든 데이터 합쳐서 가공하기
      let result = [];
      for (const item of res) {
        result.push(...item.rows);
      }
      //시간 순서대로 정렬
      result = result.sort((a, b) => {
        return new Date(b.create_date) - new Date(a.create_date);
      });
      result = result.map((item) => {
        return {
          ...item,
          update_date: item.create_date.toString(),
        };
      });
      response.json({
        success: true,
        data: result,
      });
    });
}

router.use("/", verifyToken);
router.put("/", conditionUpdate);
router.get("/", getCondition);

module.exports = router;
