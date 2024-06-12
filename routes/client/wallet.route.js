const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const WalletController = require("../../controllers/client/wallet.controller");

route.post("/fetch", checkAccessWithSecretKey(), WalletController.getWalletDetails);

route.post("/submit", checkAccessWithSecretKey(), WalletController.submitBankDetails);

module.exports = route;