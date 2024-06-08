//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const contactController = require("../../controllers/admin/contact.controller");

//create contact
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), contactController.store);

//update contact
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), contactController.update);

//delete contact
route.delete("/delete", checkAccessWithSecretKey(), contactController.destroy);

//get contact
route.get("/", checkAccessWithSecretKey(), contactController.get);

module.exports = route;
