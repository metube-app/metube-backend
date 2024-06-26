//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const videoController = require("../../controllers/client/video.controller");

//upload (normal videos or shorts) by the user
route.post(
  "/createVideo",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "videoImage", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  videoController.createVideo
);

route.post(
  "/deleteVideo",
  checkAccessWithSecretKey(),
  videoController.deleteVideo
);

//when user share (normal videos or shorts) then shareCount increased
route.post("/shareCount", checkAccessWithSecretKey(), videoController.shareCount);

//get shorts from home page directly
route.get("/shortsOfUser", checkAccessWithSecretKey(), videoController.shortsOfUser);

//get all shorts for user (shorts)
route.get("/getShorts", checkAccessWithSecretKey(), videoController.getShorts);

//get all normal videos for user (home)
route.get("/getVideos", checkAccessWithSecretKey(), videoController.getVideos);

//get channel details of shorts for user
route.get("/channeldetailsOfShorts", checkAccessWithSecretKey(), videoController.channeldetailsOfShorts);

//get all (normal videos or shorts) for user (home)
route.get("/videosOfHome", checkAccessWithSecretKey(), videoController.videosOfHome);

//get particular normal video's details for user
route.get("/detailsOfVideo", checkAccessWithSecretKey(), videoController.detailsOfVideo);

//create like or dislike for video (normal videos or shorts)
route.post("/likeOrDislikeOfVideo", checkAccessWithSecretKey(), videoController.likeOrDislikeOfVideo);

//get all more like this (normal videos or shorts)
route.get("/getAllLikeThis", checkAccessWithSecretKey(), videoController.getAllLikeThis);

//search (normal videos or shorts) for user
route.post("/search", checkAccessWithSecretKey(), videoController.search);

//previous search (normal videos or shorts) for user
route.get("/searchData", checkAccessWithSecretKey(), videoController.searchData);

//search shorts for user
route.post("/searchShorts", checkAccessWithSecretKey(), videoController.searchShorts);

//clear all searchHistory for particular user
route.delete("/clearAllSearchHistory", checkAccessWithSecretKey(), videoController.clearAllSearchHistory);

module.exports = route;
