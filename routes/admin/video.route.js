//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const videoController = require("../../controllers/admin/video.controller");

//upload (normal video or short) by the admin
route.post(
  "/uploadVideo",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "videoImage", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  videoController.uploadVideo
);

//update (normal video or short) by the admin
route.patch(
  "/updateVideo",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "videoImage", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  videoController.updateVideo
);

//delete (normal video or short) by admin (multiple or single)
route.delete("/deleteVideo", checkAccessWithSecretKey(), videoController.deleteVideo);

//get all normal video or short
route.get("/videosOrShorts", checkAccessWithSecretKey(), videoController.videosOrShorts);

module.exports = route;
