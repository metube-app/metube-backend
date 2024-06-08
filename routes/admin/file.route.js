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
const FileController = require("../../controllers/admin/file.controller");

//uploadContent
route.post("/upload-file", upload.single("content"), checkAccessWithSecretKey(), FileController.uploadContent);

//delete uploadContent
route.delete("/delete-upload", checkAccessWithSecretKey(), FileController.deleteUploadContent);

module.exports = route;
