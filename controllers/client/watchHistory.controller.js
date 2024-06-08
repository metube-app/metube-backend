const WatchHistory = require("../../models/watchHistory.model");

//import model
const User = require("../../models/user.model");
const Video = require("../../models/video.model");
const Setting = require("../../models/setting.model");

//when user view the video create watchHistory of the particular video
exports.createWatchHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.videoId || !req.query.videoUserId || !req.query.videoChannelId || !req.query.currentWatchTime) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const watchTimeInMinutes = Math.floor(parseFloat(req.query.currentWatchTime));
    console.log("watchTimeInMinutes =================", watchTimeInMinutes);

    const watchTimeInHours = watchTimeInMinutes / 60; // Convert minutes to hours
    console.log("watchTimeInHours ====================", watchTimeInHours);

    const [setting, user, video, alreadyWatchHistory] = await Promise.all([
      Setting.findOne().sort({ createdAt: -1 }),
      User.findOne({ _id: req.query.userId, isActive: true }),
      Video.findOne({
        _id: req.query.videoId,
        userId: req.query.videoUserId,
        channelId: req.query.videoChannelId,
        isActive: true,
      }),
      WatchHistory.findOne({
        userId: req.query.userId,
        videoId: req.query.videoId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "video does not found!" });
    }

    if (!setting || !setting.earningPerHour) {
      return res.status(200).json({ status: false, message: "earningPerHour not configured in settings!" });
    }

    const earningPerHour = setting.earningPerHour;
    const totalEarnings = (watchTimeInHours * earningPerHour).toFixed(2);

    const updatePromises = [];

    updatePromises.push(
      User.updateOne(
        { _id: req.query.videoUserId, channelId: req.query.videoChannelId },
        {
          $inc: {
            totalWatchTime: watchTimeInMinutes,
            totalCurrentWatchTime: watchTimeInMinutes,
            totalWithdrawableAmount: totalEarnings,
          },
        }
      )
    );

    if (!alreadyWatchHistory) {
      updatePromises.push(
        WatchHistory.create({
          userId: user._id,
          videoId: video._id,
          videoUserId: video.userId,
          videoChannelId: video.channelId,
          totalWatchTime: watchTimeInMinutes,
          totalWithdrawableAmount: totalEarnings,
        })
      );
    } else {
      updatePromises.push(
        WatchHistory.updateOne(
          { _id: alreadyWatchHistory._id },
          {
            $inc: {
              totalWatchTime: watchTimeInMinutes,
              totalWithdrawableAmount: totalEarnings,
            },
          }
        )
      );
    }

    await Promise.all(updatePromises);

    return res.status(200).json({ status: true, message: "when user view the video then created watchHistory for that video." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get user wise watchHistory
exports.getWatchHistory = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const watchHistory = await WatchHistory.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videoId",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $unwind: "$video",
      },
      {
        $lookup: {
          from: "users",
          localField: "video.channelId",
          foreignField: "channelId",
          as: "channel",
        },
      },
      {
        $unwind: "$channel",
      },
      {
        $lookup: {
          from: "watchhistories",
          let: { videoId: "$video._id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$videoId", "$$videoId"] },
              },
            },
          ],
          as: "views",
        },
      },
      {
        $project: {
          videoId: "$video._id",
          videoTitle: "$video.title",
          videoType: "$video.videoType",
          videoTime: "$video.videoTime",
          videoUrl: "$video.videoUrl",
          videoImage: "$video.videoImage",
          views: { $size: "$views" },
          channelName: "$channel.fullName",
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "get the history for that user!", watchHistory: watchHistory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
