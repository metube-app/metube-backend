//express
const express = require("express");
const route = express.Router();

//require admin's route.js
const user = require("./user.route");
const FAQ = require("./FAQ.route");
const admin = require("./admin.route");
const premiumPlan = require("./premiumPlan.route");
const contact = require("./contact.route");
const soundList = require("./soundList.route");
const soundCategory = require("./soundCategory.route");
const dashboard = require("./dashboard.route");
const setting = require("./setting.route");
const withdraw = require("./withdraw.route");
const file = require("./file.route");
const video = require("./video.route");
const videoComment = require("./videoComment.route");
const report = require("./report.route");
const advertise = require("./advertise.route");
const currency = require("./currency.route");
const withDrawalRequest = require("./withDrawalRequest.route");
const monetizationRequest = require("./monetizationRequest.route");
const login = require("./login.route");

//exports admin's route.js
route.use("/admin", admin);
route.use("/user", user);
route.use("/contact", contact);
route.use("/FAQ", FAQ);
route.use("/premiumPlan", premiumPlan);
route.use("/soundList", soundList);
route.use("/soundCategory", soundCategory);
route.use("/dashboard", dashboard);
route.use("/setting", setting);
route.use("/withdraw", withdraw);
route.use("/file", file);
route.use("/video", video);
route.use("/videoComment", videoComment);
route.use("/report", report);
route.use("/advertise", advertise);
route.use("/currency", currency);
route.use("/withDrawalRequest", withDrawalRequest);
route.use("/monetizationRequest", monetizationRequest);
route.use("/login", login);

module.exports = route;
