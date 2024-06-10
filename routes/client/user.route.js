//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const UserController = require("../../controllers/client/user.controller");

//user login or sign up
route.post("/login", checkAccessWithSecretKey(), UserController.store);

//check the user is exists or not
route.post("/checkUser", checkAccessWithSecretKey(), UserController.checkUser);

//get user profile who login
route.get("/profile", checkAccessWithSecretKey(), UserController.getProfile);

//update details of the channel (create your channel button)
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), UserController.update);

//update profile of the user (when user login or signUp)
route.patch("/updateProfile", checkAccessWithSecretKey(), upload.single("image"), UserController.updateProfile);

//update password
route.patch("/updatePassword", checkAccessWithSecretKey(), UserController.updatePassword);

//set password
route.post("/setPassword", checkAccessWithSecretKey(), UserController.setPassword);

//get particular channel's details (home page)
route.get("/detailsOfChannel", checkAccessWithSecretKey(), UserController.detailsOfChannel);

//get particular's channel's videoType wise videos (videos, shorts) (your videos)
route.get("/videosOfChannel", checkAccessWithSecretKey(), UserController.videosOfChannel);

//get particular's channel's playLists
route.get("/playListsOfChannel", checkAccessWithSecretKey(), UserController.playListsOfChannel);

//get particular channel's about
route.get("/aboutOfChannel", checkAccessWithSecretKey(), UserController.aboutOfChannel);

//search channel for user
route.post("/searchChannel", checkAccessWithSecretKey(), UserController.searchChannel);

module.exports = route;
