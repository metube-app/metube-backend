const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");
const { storyUpload, getStories, getFollowerStories } = require("../../controllers/client/story.controller");

route.put("/upload-file", upload.single("content"), checkAccessWithSecretKey(), storyUpload);

route.post("/get-stories", checkAccessWithSecretKey(), getStories);

route.post("/get-all-stories", checkAccessWithSecretKey(), getFollowerStories);

module.exports = route;