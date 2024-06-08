const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const WithdrawalRequestController = require("../../controllers/client/withDrawalRequest.controller");

//withdraw request made by particular user
route.post("/createWithdrawRequest", checkAccessWithSecretKey(), WithdrawalRequestController.createWithdrawRequest);

//get all withdraw request by particular user
route.get("/getWithdrawRequests", checkAccessWithSecretKey(), WithdrawalRequestController.getWithdrawRequests);

module.exports = route;
