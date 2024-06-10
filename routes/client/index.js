//express
const express = require("express");
const route = express.Router();

//require client's route.js
const user = require("./user.route");
const FAQ = require("./FAQ.route");
const premiumPlan = require("./premiumPlan.route");
const contact = require("./contact.route");
const video = require("./video.route");
const watchHistory = require("./watchHistory.route");
const userWiseSubscription = require("./userWiseSubscription.route");
const playlist = require("./playList.route");
const userWiseDownload = require("./userWiseDownload.route");
const saveToWatchLater = require("./saveToWatchLater.route");
const notification = require("./notification.route");
const report = require("./report.route");
const videoComment = require("./videoComment.route");
const file = require("./file.route");
const soundList = require("./soundList.route");
const liveUser = require("./liveUser.route");
const withdraw = require("./withdraw.route");
const otp = require("./otp.route");
const withdrawalRequest = require("./withdrawalRequest.route");
const monetizationRequest = require("./monetizationRequest.route");
const setting = require("./setting.route");
const follow = require("./follow.route");

//exports client's route.js
route.use("/user", user);
route.use("/FAQ", FAQ);
route.use("/premiumPlan", premiumPlan);
route.use("/contact", contact);
route.use("/video", video);
route.use("/watchHistory", watchHistory);
route.use("/userWiseSubscription", userWiseSubscription);
route.use("/playlist", playlist);
route.use("/userWiseDownload", userWiseDownload);
route.use("/saveToWatchLater", saveToWatchLater);
route.use("/notification", notification);
route.use("/report", report);
route.use("/videoComment", videoComment);
route.use("/file", file);
route.use("/soundList", soundList);
route.use("/liveUser", liveUser);
route.use("/withdraw", withdraw);
route.use("/otp", otp);
route.use("/social", follow);
route.use("/withdrawalRequest", withdrawalRequest);
route.use("/monetizationRequest", monetizationRequest);
route.use("/setting", setting);

module.exports = route;
