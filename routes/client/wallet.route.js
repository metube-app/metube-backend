const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const WalletController = require("../../controllers/client/wallet.controller");
const walletModel = require("../../models/wallet.model");

route.post("/fetch", checkAccessWithSecretKey(), WalletController.getWalletDetails);

module.exports = route;