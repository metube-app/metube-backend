const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");
const {
  storyUpload,
  getStories,
  getFollowerStories,
  deleteStory,
} = require("../../controllers/client/story.controller");

route.put(
  "/upload-file",
  upload.single("content"),
  checkAccessWithSecretKey(),
  storyUpload
);

route.get("/get-all-stories", checkAccessWithSecretKey(), getFollowerStories);

route.post("/delete-story", checkAccessWithSecretKey(), deleteStory);

module.exports = route;
