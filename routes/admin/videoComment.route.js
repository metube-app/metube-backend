//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const VideoCommentController = require("../../controllers/admin/videoComment.controller");

//get particular video's comment
route.get("/getComment", checkAccessWithSecretKey(), VideoCommentController.getComment);

//get comments of all videos added by user and admin
route.get("/commentsOfVideos", checkAccessWithSecretKey(), VideoCommentController.commentsOfVideos);

//delete videoComment by admin (multiple or single)
route.delete("/deleteVideoComment", checkAccessWithSecretKey(), VideoCommentController.deleteVideoComment);

module.exports = route;
