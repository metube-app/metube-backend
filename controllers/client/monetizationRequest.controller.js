const MonetizationRequest = require("../../models/monetizationRequest.model");

//import models
const User = require("../../models/user.model");
const UserWiseSubscription = require("../../models/userWiseSubscription.model");
const WatchHistory = require("../../models/watchHistory.model");
const Setting = require("../../models/setting.model");

//monetization request made by particular user
exports.createMonetizationRequest = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const [user, setting] = await Promise.all([
      User.findOne({ _id: req.query.userId, isActive: true }),
      Setting.findOne().sort({ createdAt: -1 }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!user.isChannel) {
      return res
        .status(200)
        .json({ status: false, message: "channel of that user does not created please firstly create channel of that user!" });
    }

    if (!user.isMonetization) {
      return res.status(200).json({ status: false, message: "Oops! Monetization is not allowed for your account." });
    }

    if (!setting || !setting.minSubScriber || !setting.minWatchTime) {
      return res.status(200).json({
        status: false,
        message: "minSubScriber and minWatchTime not configured in settings.",
      });
    }

    if (!setting.isMonetization) {
      return res.status(200).json({
        status: false,
        message: "Apologies! The administrator has disabled the monetization settings.",
      });
    }

    const existRequest = await MonetizationRequest.findOne({ userId: user._id });
    if (existRequest?.status == 1) {
      return res
        .status(200)
        .json({ status: true, message: "Monetization request already send by you to admin.", monetizationRequest: existRequest });
    } else if (existRequest?.status == 2) {
      return res.status(200).json({
        status: false,
        message:
          "Your monetization request has already been approved by the admin, and as such, you are unable to submit the same request for a second time.",
        monetizationRequest: existRequest,
      });
    } else if (existRequest?.status == 3) {
      await existRequest.deleteOne();

      const [saveMonetizationRequest, saveUser] = await Promise.all([
        MonetizationRequest.create({
          userId: user._id,
          channelId: user.channelId,
          channelName: user.fullName,
          totalWatchTime: user.totalWatchTime,
          status: 1,
          requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),

        User.updateOne(
          { _id: user._id },
          {
            $set: { totalWatchTime: 0 },
          }
        ),
      ]);

      return res.status(200).json({
        status: true,
        message: "Monetization request already declined by admin and new request has been created.",
        monetizationRequest: saveMonetizationRequest,
      });
    } else {
      const [saveMonetizationRequest, saveUser] = await Promise.all([
        MonetizationRequest.create({
          userId: user._id,
          channelId: user.channelId,
          channelName: user.fullName,
          totalWatchTime: user.totalWatchTime,
          status: 1,
          requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),

        User.updateOne(
          { _id: user._id },
          {
            $set: { totalWatchTime: 0 },
          }
        ),
      ]);

      return res
        .status(200)
        .json({ status: true, message: "Monetization request has been send to admin.", monetizationRequest: saveMonetizationRequest });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get monetization for the particular user (after monetiization on)
exports.getMonetizationForUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [channel, totalSubscribers, dateWiseotalSubscribers, totalViewsOfthatChannelVideos, watchHistoryResults] = await Promise.all([
      User.findOne({ channelId: user.channelId }).select("fullName image channelId totalWithdrawableAmount"),
      UserWiseSubscription.countDocuments({ channelId: user.channelId }),

      UserWiseSubscription.countDocuments({ channelId: user.channelId, ...dateFilterQuery }),
      WatchHistory.countDocuments({ videoChannelId: user.channelId, ...dateFilterQuery }),
      WatchHistory.aggregate([
        { $match: { videoChannelId: user.channelId, ...dateFilterQuery } },
        {
          $group: {
            _id: null,
            totalWatchTime: { $sum: "$totalWatchTime" },
          },
        },
      ]),
    ]);

    // Calculate total watch time and total withdrawable amount for the channel
    const totalWatchTimeMinutes = watchHistoryResults.length > 0 ? watchHistoryResults[0].totalWatchTime : 0;
    const totalWatchTimeHours = totalWatchTimeMinutes / 60; // Convert total watch time from minutes to hours

    return res.status(200).json({
      status: true,
      message: "finally, get Monetization of the particular user.",
      monetizationOfChannel: {
        channel,
        totalSubscribers,
        dateWiseotalSubscribers,
        totalViewsOfthatChannelVideos,
        totalWatchTime: totalWatchTimeHours,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get minimum criteria and actual result of particular user (check monetization for user)
exports.getMonetization = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried" });
    }

    const [user, setting] = await Promise.all([
      User.findOne({ _id: req.query.userId, isActive: true }),
      Setting.findOne().sort({ createdAt: -1 }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!setting || !setting.minSubScriber || !setting.minWatchTime) {
      return res.status(200).json({
        status: false,
        message: "minSubScriber and minWatchTime not configured in settings.",
      });
    }

    const [totalSubscribers, watchHistoryResults] = await Promise.all([
      UserWiseSubscription.countDocuments({ channelId: user.channelId }),
      WatchHistory.aggregate([
        { $match: { videoChannelId: user.channelId } },
        {
          $group: {
            _id: null,
            totalWatchTime: { $sum: "$totalWatchTime" },
          },
        },
      ]),
    ]);

    // Calculate total watch time and total withdrawable amount for the channel
    const totalWatchTimeMinutes = watchHistoryResults.length > 0 ? watchHistoryResults[0].totalWatchTime : 0;
    const totalWatchTimeHours = totalWatchTimeMinutes / 60; // Convert total watch time from minutes to hours

    const dataOfMonetization = {
      minWatchTime: setting.minWatchTime,
      minSubScriber: setting.minSubScriber,
      totalSubscribers: totalSubscribers,
      totalWatchTime: totalWatchTimeHours,
      isMonetization: user.isMonetization,
    };

    return res.status(200).json({
      status: true,
      message: "finally, get Monetization of the particular user.",
      dataOfMonetization: dataOfMonetization,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
