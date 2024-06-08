const UserWiseSubscription = require("../../models/userWiseSubscription.model");

//import model
const User = require("../../models/user.model");
const WatchHistory = require("../../models/watchHistory.model");

//mongoose
const mongoose = require("mongoose");

//user wise subscribed or unSubscribed the channel
exports.subscribedUnSubscibed = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.channelId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [user, channel, alreadySubscribedChannelByUser] = await Promise.all([
      User.findOne({ _id: req.query.userId, isActive: true }),
      User.findOne({ channelId: req.query.channelId }),
      UserWiseSubscription.findOne({
        userId: req.query.userId,
        channelId: req.query.channelId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found." });
    }

    if (alreadySubscribedChannelByUser) {
      await UserWiseSubscription.deleteOne({
        userId: user._id,
        channelId: channel.channelId,
      });

      return res.status(200).json({
        status: true,
        message: "finally, channel is unSubscribed by that user!",
        isSubscribed: false,
      });
    } else {
      const subscribedByUser = new UserWiseSubscription();

      subscribedByUser.userId = user?._id;
      subscribedByUser.channelId = channel?.channelId;
      await subscribedByUser.save();

      return res.status(200).json({
        status: true,
        message: "finally, channel is subscribed by that user!",
        isSubscribed: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get all subscription channels subscribed by that user
exports.getSubscribedChannel = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, subscribedChannel] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }),
      UserWiseSubscription.find({ userId: userId }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!subscribedChannel || subscribedChannel.length === 0) {
      return res.status(200).json({ status: false, message: "No channels have been subscribed by that user." });
    }

    const channelsInfoPromises = subscribedChannel?.map(async (subscription) => {
      const channel = await User.findOne({ channelId: subscription.channelId });
      if (channel) {
        return {
          channelId: subscription?.channelId,
          channelName: channel?.fullName,
          channelImage: channel?.image,
        };
      }
    });

    const [totalSubscribedChannel, channelsInfo] = await Promise.all([
      UserWiseSubscription.countDocuments({ userId: user._id }),
      Promise.all(channelsInfoPromises),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get all subscription channels subscribed by that user!",
      totalSubscribedChannel: totalSubscribedChannel,
      subscribedChannel: channelsInfo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get type wise videos of the subscribed channels
exports.videoOfSubscribedChannel = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (req.query.type === "today") {
      const today = new Date();
      console.log("today: ", today);
      today.setHours(0, 0, 0, 0); //Set time to the beginning of the day

      const videoOfSubscribedChannel = await UserWiseSubscription.aggregate([
        {
          $match: { userId: user._id },
        },
        {
          $lookup: {
            from: "videos",
            localField: "channelId",
            foreignField: "channelId",
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
          $match: {
            "video.createdAt": { $gte: today },
          },
        },
        {
          $lookup: {
            from: "savetowatchlaters",
            let: { videoId: "$video._id", userId: userId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$videoId", "$$videoId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "isSaveToWatchLater",
          },
        },
        {
          $project: {
            isSaveToWatchLater: {
              $cond: [{ $eq: [{ $size: "$isSaveToWatchLater" }, 0] }, false, true],
            },

            videoId: "$video._id",
            videoTitle: "$video.title",
            videoType: "$video.videoType",
            videoTime: "$video.videoTime",
            videoUrl: "$video.videoUrl",
            videoImage: "$video.videoImage",
            videoCreatedAt: "$video.createdAt",
            channelName: "$channel.fullName",
            channelId: "$channel.channelId",
            channelImage: "$channel.image",
            views: { $size: "$views" },
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: `finally, get videos of the subscribed channel with type is ${req.query.type}!`,
        videoOfSubscribedChannel,
      });
    } else if (req.query.type === "continueWatching") {
      const userWatchedChannels = await WatchHistory.distinct("videoChannelId", { userId: user._id });
      console.log("userWatchedChannels: ", userWatchedChannels);

      const videoOfSubscribedChannel = await UserWiseSubscription.aggregate([
        {
          $match: { userId: user._id, channelId: { $in: userWatchedChannels } },
        },
        {
          $lookup: {
            from: "videos",
            localField: "channelId",
            foreignField: "channelId",
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
          $lookup: {
            from: "savetowatchlaters",
            let: { videoId: "$video._id", userId: userId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$videoId", "$$videoId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "isSaveToWatchLater",
          },
        },
        {
          $project: {
            isSaveToWatchLater: {
              $cond: [{ $eq: [{ $size: "$isSaveToWatchLater" }, 0] }, false, true],
            },

            videoId: "$video._id",
            videoTitle: "$video.title",
            videoType: "$video.videoType",
            videoTime: "$video.videoTime",
            videoUrl: "$video.videoUrl",
            videoImage: "$video.videoImage",
            videoCreatedAt: "$video.createdAt",
            channelName: "$channel.fullName",
            channelId: "$channel.channelId",
            channelImage: "$channel.image",
            views: { $size: "$views" },
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: `finally, get videos of the subscribed channel with type is ${req.query.type}!`,
        videoOfSubscribedChannel,
      });
    } else if (req.query.type === "all") {
      const videoOfSubscribedChannel = await UserWiseSubscription.aggregate([
        {
          $match: { userId: user._id },
        },
        {
          $lookup: {
            from: "videos",
            localField: "channelId",
            foreignField: "channelId",
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
          $lookup: {
            from: "savetowatchlaters",
            let: { videoId: "$video._id", userId: userId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$videoId", "$$videoId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "isSaveToWatchLater",
          },
        },
        {
          $project: {
            isSaveToWatchLater: {
              $cond: [{ $eq: [{ $size: "$isSaveToWatchLater" }, 0] }, false, true],
            },

            videoId: "$video._id",
            videoTitle: "$video.title",
            videoType: "$video.videoType",
            videoTime: "$video.videoTime",
            videoUrl: "$video.videoUrl",
            videoImage: "$video.videoImage",
            videoCreatedAt: "$video.createdAt",
            channelName: "$channel.fullName",
            channelId: "$channel.channelId",
            channelImage: "$channel.image",
            views: { $size: "$views" },
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: `finally, get videos of the subscribed channel with type is ${req.query.type}!`,
        videoOfSubscribedChannel,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
