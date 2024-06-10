const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const {
  followPerson,
  unfollowPerson,
} = require("../../controllers/client/follow.controller");

route.post("/follow", followPerson);
route.post("/unfollow", unfollowPerson);

module.exports = route;