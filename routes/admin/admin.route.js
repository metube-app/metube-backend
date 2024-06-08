//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//admin middleware
const AdminMiddleware = require("../../middleware/admin.middleware");

//controller
const AdminController = require("../../controllers/admin/admin.controller");

//create admin
route.post("/create", AdminController.store);

//admin login
route.post("/login", AdminController.login);

//update purchase code
route.patch("/updateCode", AdminMiddleware, AdminController.updateCode);

//get admin profile
route.get("/profile", AdminMiddleware, AdminController.getProfile);

//update admin profile
route.patch("/updateProfile", upload.single("image"), AdminMiddleware, AdminController.update);

//send email for forgot the password (forgot password)
route.post("/forgotPassword", AdminController.forgotPassword);

//update admin password
route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);

//set password
route.post("/setPassword", AdminController.setPassword);

module.exports = route;
