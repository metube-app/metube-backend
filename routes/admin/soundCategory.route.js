//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const soundCategoryController = require("../../controllers/admin/soundCategory.controller");

//create soundCategory
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), soundCategoryController.create);

//update soundCategory
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), soundCategoryController.update);

//delete soundCategory
route.delete("/delete", checkAccessWithSecretKey(), soundCategoryController.destroy);

//get all soundCategory
route.get("/", checkAccessWithSecretKey(), soundCategoryController.get);

module.exports = route;
