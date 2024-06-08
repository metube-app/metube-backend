const Video = require("../../models/video.model");

//import model
const User = require("../../models/user.model");
const SoundList = require("../../models/soundsList.model");
const UserWiseSubscription = require("../../models/userWiseSubscription.model");
const Notification = require("../../models/notification.model");
const Setting = require("../../models/setting.model");
const VideoComment = require("../../models/videoComment.model");
const Report = require("../../models/report.model");
const SaveToWatchLater = require("../../models/saveToWatchLater.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfVideo.model");
const LikeHistoryOfVideoComment = require("../../models/likeHistoryOfVideoComment.model");
const PlayList = require("../../models/playList.model");

//fcm node
var FCM = require("fcm-node");
var fcm = new FCM(process?.env?.SERVER_KEY);

//momemt
const moment = require("moment");

//generateUniqueVideoId
const { generateUniqueVideoId } = require("../../util/generateUniqueVideoId");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//upload (normal videos or shorts) by the admin
exports.uploadVideo = async (req, res) => {
  try {
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.hashTag ||
      !req.body.videoType ||
      !req.body.videoTime ||
      !req.body.visibilityType ||
      !req.body.audienceType ||
      !req.body.commentType ||
      !req.body.scheduleType ||
      !req.body.location ||
      !req.body.latitude ||
      !req.body.longitude ||
      !req.body.userId ||
      !req.body.channelId ||
      !req.body.videoUrl ||
      !req.body.videoImage
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (req.body.scheduleType == 1 && !req.body.scheduleTime) {
      return res.status(200).json({ status: false, message: "scheduleTime must be required!" });
    }

    if (req.body.videoType == 2) {
      const setting = await Setting.findOne().sort({ createdAt: -1 });
      if (!setting) {
        return res.status(200).json({ status: false, message: "setting does not found!" });
      }

      if (setting.durationOfShorts < parseInt(req.body.videoTime)) {
        return res.status(200).json({ status: false, message: "your duration of Shorts greater than decided by admin!" });
      }
    }

    const user = await User.findOne({ _id: req.body.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    const channel = await User.findOne({ channelId: user.channelId });
    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found!" });
    }

    if (user.channelId !== req.body.channelId) {
      return res.status(200).json({ status: false, message: "video has been uploaded only by own channelId" });
    }

    const video = new Video();

    video.title = req?.body?.title;
    video.videoType = req?.body?.videoType;
    video.description = req?.body?.description;
    video.videoTime = req?.body?.videoTime;
    video.visibilityType = req?.body?.visibilityType;
    video.audienceType = req?.body?.audienceType;
    video.commentType = req?.body?.commentType;
    video.videoUrl = req?.body?.videoUrl;
    video.videoImage = req?.body?.videoImage;
    video.isAddByAdmin = true;

    if (req?.body?.scheduleType) {
      video.scheduleType = req?.body?.scheduleType;

      if (req?.body?.scheduleType == 1) {
        video.scheduleTime = moment(req?.body?.scheduleTime).toISOString(); //e.g."2023-07-11T18:00:00.000Z"
      } else if (req?.body?.scheduleType == 2) {
        video.scheduleTime = "";
      } else {
        return res.status(200).json({ status: false, message: "scheduleType must be passed valid!" });
      }
    }

    video.location = req?.body?.location;
    video.locationCoordinates.latitude = req?.body?.latitude;
    video.locationCoordinates.longitude = req?.body?.longitude;
    video.userId = user._id;
    video.channelId = channel.channelId;

    //hashTag
    const multiplehashTag = req.body.hashTag.toString().split(",");
    video.hashTag = multiplehashTag;

    //uniqueVideoId
    const uniqueVideoId = await generateUniqueVideoId();
    video.uniqueVideoId = uniqueVideoId;

    await video.save();

    const data = await Video.findById(video._id).populate([{ path: "userId", select: "fullName nickName uniqueId image" }]);

    //if user subscribed that channel then send notification to that users
    const channelSubscribedByUsers = await UserWiseSubscription.find({ channelId: req.body.channelId }).distinct("userId");
    console.log("channelSubscribedByUsers: ", channelSubscribedByUsers);

    await Promise.all(
      channelSubscribedByUsers.map(async (userId) => {
        const user = await User.findById(userId);
        console.log("userId:", userId);
        console.log("user:", user._id);

        //Check if user exists and is not the same as the video uploader
        if (user._id.toString() !== req.body.userId.toString()) {
          console.log("come");

          const notification = new Notification();

          notification.title = "🔔 New Video Alert! 🔔";
          notification.message = "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!";
          notification.userId = user?._id;
          notification.videoId = video?._id;
          notification.channelImage = channel.image;
          notification.videoImage = video.videoImage;
          await notification.save();

          //checks if the user has an fcmToken
          if (user.fcmToken) {
            const payload = {
              registration_ids: [user.fcmToken],
              notification: {
                title: "🔔 New Video Alert! 🔔",
                body: "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!",
              },
            };

            await fcm.send(payload, function (error, response) {
              if (error) {
                console.log("Something has gone wrong: ", error);
              } else {
                console.log("Successfully sent with response: ", response);
              }
            });
          }
        }
      })
    );

    return res.status(200).json({
      status: true,
      message: "finally, normal videos or shorts has been uploaded by the admin!",
      video: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update (normal videos or shorts) by the admin
exports.updateVideo = async (req, res) => {
  try {
    if (!req.query.videoId || !req.query.userId || !req.query.channelId || !req.query.videoType) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const channel = await User.findOne({ channelId: user.channelId });
    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found!" });
    }

    if (user.channelId !== req.query.channelId) {
      return res.status(200).json({ status: false, message: "video has been updated only by own channelId" });
    }

    const video = await Video.findOne({ _id: req.query.videoId, isActive: true, videoType: req.query.videoType }).populate(
      "userId",
      "fullName nickName image"
    );
    if (!video) {
      return res.status(200).json({ status: false, message: "video does not found!" });
    }

    video.title = req?.body?.title ? req?.body?.title : video.title;
    video.description = req?.body?.description ? req?.body?.description : video.description;

    if (req.query.videoType == 2) {
      const setting = await Setting.findOne();
      if (!setting) return res.status(200).json({ status: false, message: "setting does not found!" });

      if (req?.body?.videoTime) {
        if (setting.durationOfShorts < Number(req?.body?.videoTime)) {
          return res.status(200).json({ status: false, message: "your duration of Shorts greater than decided by admin!" });
        }

        video.videoTime = req?.body?.videoTime ? req?.body?.videoTime : video.videoTime;
      }
    }

    video.visibilityType = req?.body?.visibilityType ? req?.body?.visibilityType : video.visibilityType;
    video.audienceType = req?.body?.audienceType ? req?.body?.audienceType : video.audienceType;
    video.commentType = req?.body?.commentType ? req?.body?.commentType : video.commentType;

    if (req?.body?.scheduleType) {
      video.scheduleType = req?.body?.scheduleType ? req?.body?.scheduleType : video.scheduleType;

      if (req?.body?.scheduleType == 1) {
        video.scheduleTime = req?.body?.scheduleTime ? moment(req?.body?.scheduleTime).toDate() : video.scheduleTime; //e.g."2023-07-11T18:00:00.000Z"
      } else if (req?.body?.scheduleType == 2) {
        video.scheduleTime = "";
      } else {
        return res.status(200).json({ status: false, message: "scheduleType must be passed valid!" });
      }
    }

    video.location = req?.body?.location ? req?.body?.location : video.location;
    video.locationCoordinates.latitude = req?.body?.latitude ? req?.body?.latitude : video.latitude;
    video.locationCoordinates.longitude = req?.body?.longitude ? req?.body?.longitude : video.longitude;

    const multiplehashTag = req?.body?.hashTag ? req?.body?.hashTag.toString().split(",") : video.hashTag;
    video.hashTag = multiplehashTag;

    if (req?.body?.videoImage) {
      console.log("req?.body?.videoImage: ", req?.body?.videoImage);
      console.log("old video videoImage: ", video.videoImage);

      //delete the old videoImage from digitalOcean Spaces
      const urlParts = video.videoImage.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      video.videoImage = req?.body?.videoImage ? req?.body?.videoImage : video.videoImage;
      console.log("updated video videoImage: ", video.videoImage);
    }

    if (req?.body?.videoUrl) {
      console.log("req?.body?.videoUrl: ", req?.body?.videoUrl);
      console.log("old video videoUrl: ", video.videoUrl);

      //delete the old videoUrl from digitalOcean Spaces
      const urlParts = video.videoUrl.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      video.videoUrl = req?.body?.videoUrl ? req?.body?.videoUrl : video.videoUrl;
      console.log("updated video videoUrl: ", video.videoUrl);
    }

    await video.save();

    return res.status(200).json({
      status: true,
      message: "finally, video has been updated by admin!",
      video: video,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete (normal videos or shorts) by admin (multiple or single)
exports.deleteVideo = async (req, res) => {
  try {
    if (!req.query.videoId) {
      return res.status(200).json({ status: false, message: "videoId must be required!" });
    }

    const videoIds = req.query.videoId.split(",");

    const videos = await Promise.all(videoIds.map((videoId) => Video.findById(videoId)));
    if (videos.some((video) => !video)) {
      return res.status(200).json({ status: false, message: "No videos found with the provided IDs." });
    }

    await Promise.all(
      videos.map(async (video) => {
        if (video?.videoImage || video?.videoUrl) {
          const urlParts = video?.videoImage ? video?.videoImage.split("/") : video?.videoUrl.split("/");
          const keyName = urlParts.pop();
          const folderStructure = urlParts.slice(3).join("/");

          await deleteFromSpace({ folderStructure, keyName });
        }
      })
    );

    await Promise.all([
      Video.deleteMany({ _id: { $in: videoIds } }),
      Notification.deleteMany({ videoId: { $in: videoIds } }),
      VideoComment.deleteMany({ videoId: { $in: videoIds } }),
      Report.deleteMany({ videoId: { $in: videoIds } }),
      SaveToWatchLater.deleteMany({ videoId: { $in: videoIds } }),
      LikeHistoryOfVideo.deleteMany({ videoId: { $in: videoIds } }),
      PlayList.deleteMany({ videoId: { $in: videoIds } }),
    ]);

    return res.status(200).json({ status: true, message: "finally, videos have been deleted by admin." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get all normal videos or shorts
exports.videosOrShorts = async (req, res) => {
  try {
    if (!req.query.videoType || !req.query.start || !req.query.limit || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

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
    //console.log("dateFilterQuery:   ", dateFilterQuery);

    const [totalVideosOrShorts, data] = await Promise.all([
      Video.countDocuments({ videoType: Number(req.query.videoType) }),

      Video.aggregate([
        {
          $match: { videoType: Number(req.query.videoType) },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            uniqueVideoId: 1,
            title: 1,
            description: 1,
            hashTag: 1,
            videoType: 1,
            videoTime: 1,
            videoUrl: 1,
            videoImage: 1,
            visibilityType: 1,
            audienceType: 1,
            commentType: 1,
            scheduleType: 1,
            scheduleTime: 1,
            location: 1,
            locationCoordinates: 1,
            channelId: 1,
            createdAt: 1,
            uniqueId: "$user.uniqueId",
            fullName: "$user.fullName",
            nickName: "$user.nickName",
            image: "$user.image",
            userId: "$user._id",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit }, //how many records you want to skip
        { $limit: limit },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get videoType wise videos or shorts for admin!",
      totalVideosOrShorts: totalVideosOrShorts,
      videosOrShorts: data.length > 0 ? data : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
