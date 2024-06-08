//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const WithdrawController = require("../../controllers/admin/withdraw.controller");

//store Withdraw
route.post("/create", upload.single("image"), checkAccessWithSecretKey(), WithdrawController.store);

//update Withdraw
route.patch("/update", upload.single("image"), checkAccessWithSecretKey(), WithdrawController.update);

//get Withdraw
route.get("/", checkAccessWithSecretKey(), WithdrawController.get);

//delete Withdraw
route.delete("/", checkAccessWithSecretKey(), WithdrawController.delete);

//handle isEnabled switch
route.patch("/handleSwitch", checkAccessWithSecretKey(), WithdrawController.handleSwitch);

module.exports = route;
