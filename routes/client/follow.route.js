const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const {
  followPerson,
  unfollowPerson,
} = require("../../controllers/client/follow.controller");

route.post("/follow", checkAccessWithSecretKey(), followPerson);
route.post("/unfollow", checkAccessWithSecretKey(), unfollowPerson);

module.exports = route;