const express = require("express");
const router = express.Router();

const join = require("./api/join");
const login = require("./api/login");
const condition = require("./api/condition");
const friend = require("./api/friend");
const avatar = require("./api/avatar");

router.use("/join", join);
router.use("/login", login);
router.use("/condition", condition);
router.use("/friend", friend);
router.use("/avatar", avatar);

module.exports = router;
