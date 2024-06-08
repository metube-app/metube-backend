const LiveUser = require("../../models/liveUser.model");

//import model
const User = require("../../models/user.model");
const LiveHistory = require("../../models/liveHistory.model");

//FCM node
var FCM = require("fcm-node");
var fcm = new FCM(process?.env?.SERVER_KEY);

//momemt
const moment = require("moment");

//mongoose
const mongoose = require("mongoose");

const liveUserFunction = async (liveUser, data) => {
  liveUser.firstName = data.fullName;
  liveUser.lastName = data.nickName;
  liveUser.image = data.image;
  liveUser.channel = data.channel;
  liveUser.userId = data._id;

  await liveUser.save();
  return liveUser;
};

//live the user
exports.liveUser = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(200).json({
        status: false,
        message: "userId must be requried.",
      });

    const userId = new mongoose.Types.ObjectId(req.body.userId);

    const [existUser, existLiveUser] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }),
      LiveUser.findOne({ userId: userId }),
    ]);

    if (!existUser) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (existUser.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (existLiveUser) {
      console.log("delete existLiveUser");
      await LiveUser.deleteOne({ userId: existUser._id });
    }

    //when user is live then create liveUser's history
    const liveHistory = new LiveHistory();

    liveHistory.userId = existUser._id;
    liveHistory.startTime = moment().format("HH:mm:ss");

    existUser.isLive = true;
    existUser.channel = liveHistory._id.toString();
    existUser.liveHistoryId = liveHistory._id;

    let liveUserData;

    const liveUser = new LiveUser();
    liveUser.liveHistoryId = liveHistory._id;
    liveUserData = await liveUserFunction(liveUser, existUser);

    const [data] = await Promise.all([LiveUser.findOne({ _id: liveUser._id }), liveHistory.save(), existUser.save()]);

    res.status(200).json({
      status: true,
      message: "finally, User is live Successfully.",
      liveUser: data,
    });

    //notification related
    const user = await User.find({
      isBlock: false,
      isLive: false,
      _id: { $ne: existUser._id },
    }).distinct("fcmToken");
    console.log("notification to users who is not live:  ", user);

    const payload = {
      registration_ids: user,
      notification: {
        title: `${existUser.fullName} is live now!`,
        body: "click and watch now!",
        image: existUser.image,
      },
    };

    await fcm.send(payload, function (error, response) {
      if (error) {
        console.log("Something has gone wrong: ", error);
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get live user list
exports.getliveUserList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const data = await User.aggregate([
      {
        $match: {
          isBlock: false,
          isLive: true,
        },
      },
      {
        $lookup: {
          from: "liveusers",
          let: { liveUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$liveUserId", "$userId"],
                },
              },
            },
          ],
          as: "liveUser",
        },
      },
      {
        $unwind: {
          path: "$liveUser",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          isLive: 1,
          fullName: 1, //channelName
          nickName: 1,
          image: 1,
          channelId: 1,
          liveHistoryId: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.liveHistoryId", null] },
          view: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.view", 0] },
        },
      },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get live user list.",
      liveUserList: data.length > 0 ? data : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
