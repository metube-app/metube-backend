const User = require("../../models/user.model");

//fs
const fs = require("fs");

//day.js
const dayjs = require("dayjs");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//import model
const Video = require("../../models/video.model");
const UserWiseSubscription = require("../../models/userWiseSubscription.model");
const PlayList = require("../../models/playList.model");
const WatchHistory = require("../../models/watchHistory.model");

//mongoose
const mongoose = require("mongoose");

//uuid
const uuid = require("uuid");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//generateUniqueId
const { generateUniqueId } = require("../../util/generateUniqueId");

//checkPlan
const { checkPlan } = require("../../util/checkPlan");

//monetization service
const { monetizationEnabled } = require("../../util/monetizationEnabled");
const followsModel = require("../../models/follows.model");
const walletModel = require("../../models/wallet.model");
const referralCostModel = require("../../models/referralCost.model");

//user function
const userFunction = async (user, data_) => {
  const data = data_.body;
  const file = data_.file;

  user.image = file ? process?.env?.baseURL + file.path : user.image;
  user.fullName = data.fullName ? data.fullName : user.fullName;
  user.nickName = data.nickName ? data.nickName : user.nickName;
  user.email = data.email.trim() ? data.email.trim() : user.email;
  user.gender = data.gender ? data.gender : user.gender;
  user.age = data.age ? data.age : user.age;
  user.mobileNumber = data.mobileNumber ? data.mobileNumber : user.mobileNumber;

  user.country = data.country ? data.country : user.country;
  user.ipAddress = data.ipAddress ? data.ipAddress : user.ipAddress;

  user.descriptionOfChannel = data.descriptionOfChannel
    ? data.descriptionOfChannel
    : user.descriptionOfChannel;

  user.socialMediaLinks.instagramLink = data.instagramLink
    ? data.instagramLink
    : user.socialMediaLinks.instagramLink;
  user.socialMediaLinks.facebookLink = data.facebookLink
    ? data.facebookLink
    : user.socialMediaLinks.facebookLink;
  user.socialMediaLinks.twitterLink = data.twitterLink
    ? data.twitterLink
    : user.socialMediaLinks.twitterLink;
  user.socialMediaLinks.websiteLink = data.websiteLink
    ? data.websiteLink
    : user.socialMediaLinks.websiteLink;

  user.loginType = data.loginType ? data.loginType : user.loginType;
  user.password = data.password ? cryptr.encrypt(data.password) : user.password;
  user.identity = data.identity;
  user.fcmToken = data.fcmToken;
  user.uniqueId = !user.uniqueId
    ? await Promise.resolve(generateUniqueId())
    : user.uniqueId;

  await user.save();

  //return user with decrypt password
  user.password = data.password
    ? await cryptr.decrypt(user.password)
    : user.password;
  return user;
};

//user login or sign up
exports.store = async (req, res) => {
  try {
    if (
      !req.body.identity ||
      req.body.loginType === undefined ||
      !req.body.fcmToken
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details." });
    }

    let userQuery;

    if (
      req.body.loginType === 1 ||
      req.body.loginType === 2 ||
      req.body.loginType === 3
    ) {
      if (!req.body.email) {
        return res
          .status(200)
          .json({ status: false, message: "email must be required." });
      }

      userQuery = await User.findOne({ email: req.body.email });
    } else if (req.body.loginType === 4) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required.",
        });
      }

      const user = await User.findOne({ email: req.body.email });

      if (user) {
        if (user.password !== req.body.password) {
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match.",
          });
        }
        userQuery = user;
      } else {
        userQuery = user;
      }
    } else {
      return res
        .status(200)
        .json({ status: false, message: "loginType must be passed valid." });
    }

    const user = userQuery;
    console.log("exist user:    ", user);

    if (user) {
      if (user.isBlock) {
        return res
          .status(200)
          .json({ status: false, message: "You are blocked by the admin." });
      }

      const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "User login Successfully.",
        user: user_,
        signUp: false,
      });
    } else {
      console.log("User signup:    ");

      const newUser = new User();

      const { email } = req.body;

      await followsModel.create({ email });

      const walletObj = await walletModel.create({ amount: 0 });

      newUser.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      const user = await userFunction(newUser, req);

      newUser.isChannel = true;
      newUser.channelId = uuid.v4();
      newUser.wallet = walletObj._id;

      await newUser.save();

      return res.status(200).json({
        status: true,
        message: "User Signup Successfully.",
        user: user,
        signUp: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.getReferral = async (req, res) => {
  try {
    const {userId, email} = req.body;

    if(!userId || !email){
      return res.status(400).json({ message : "Required fields not sent" });
    }

    const user = await User.findById(userId);

    if(!user){
      return res.status(400).json({ message : "User not found"});
    }

    const otherUser = await User.findOne({email});

    if(!otherUser){
      return res.status(400).json({ message : "Other User not found."});
    }

    if(user.isReferred){
      return res.status(400).json({ message : "You already claimed referral"});
    }

    user.referredBy = otherUser._id;
    user.isReferred = true;

    await user.save();

    const referralCost = await referralCostModel.findOne({documentId : "referralCost"}).lean();

    const walletId = otherUser.wallet;
    const userWalletId = user.wallet;

    const walletObj = await walletModel.findById(walletId);

    const userWalletObj = await walletModel.findById(userWalletId);

    if(!walletObj || !userWalletObj){
      return res.status(400).json({ message : "Wallet not found." });
    }

    walletObj.balance += referralCost.referralCost;
    userWalletObj.balance += referralCost.referredCost;

    await walletObj.save();
    await userWalletObj.save();

    return res.status(200).json({ message : "Referral Activated" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
}

//check the user is exists or not
exports.checkUser = async (req, res) => {
  try {
    if (
      !req.body.email ||
      req.body.loginType === undefined ||
      !req.body.password
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findOne({
      email: req.body.email.trim(),
      loginType: 4,
    });

    if (user) {
      if (
        (user.password ? user.password.toString() : "") !== req.body.password
      ) {
        return res.status(400).json({
          status: false,
          message: "Password doesn't match for this user.",
          isLogin: false,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "User login Successfully.",
          isLogin: true,
        });
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have sign up.",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

//update details of the channel (create your channel button)
exports.update = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.isChannel) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by admin!" });
    }

    if (req.query.isChannel === "true") {
      const isChannel = await User.findOne({ isChannel: true });
      if (!isChannel)
        return res.status(200).json({
          status: false,
          message:
            "channel of that user does not created please firstly create channel of that user!",
        });

      if (req?.body?.image) {
        console.log("req?.body?.image: ", req?.body?.image);
        console.log("old user image: ", user.image);

        //delete the old image from digitalOcean Spaces
        const urlParts = user.image.split("/");
        const keyName = urlParts.pop(); //remove the last element
        const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

        await deleteFromSpace({ folderStructure, keyName });

        user.image = req?.body?.image ? req?.body?.image : user.image;
        console.log("updated user image: ", user.image);
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        //Check if the new channelName is different from the current one
        const isDuplicateFullName = await User.findOne({
          fullName: req.body.fullName.trim(),
        });
        if (isDuplicateFullName) {
          return res.status(200).json({
            status: false,
            message:
              "The provided channelName is already in use. Please choose a different one.",
          });
        }

        user.fullName = req.body.fullName
          ? req.body.fullName.trim()
          : user.fullName; //channelName
      }

      user.descriptionOfChannel = req.body.descriptionOfChannel
        ? req.body.descriptionOfChannel
        : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink
        ? req.body.instagramLink
        : user.socialMediaLinks.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink
        ? req.body.facebookLink
        : user.socialMediaLinks.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink
        ? req.body.twitterLink
        : user.socialMediaLinks.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink
        ? req.body.websiteLink
        : user.socialMediaLinks.websiteLink;

      await user.save();

      return res.status(200).json({ status: true, message: "Success", user });
    } else if (req.query.isChannel === "false") {
      const isChannel = await User.findOne({ isChannel: false });
      if (!isChannel)
        return res.status(200).json({
          status: false,
          message:
            "channel of that user already created please passed valid isChannel true!",
        });

      user.channelId = uuid.v4();
      user.isChannel = true;

      if (req?.body?.image) {
        console.log("req?.body?.image: ", req?.body?.image);
        console.log("old user image: ", user.image);

        //delete the old image from digitalOcean Spaces
        const urlParts = user.image.split("/");
        const keyName = urlParts.pop(); //remove the last element
        const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

        await deleteFromSpace({ folderStructure, keyName });

        user.image = req?.body?.image ? req?.body?.image : user.image;
        console.log("updated user image: ", user.image);
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        // Check if the new channelName is different from the current one
        const isDuplicateFullName = await User.findOne({
          fullName: req.body.fullName.trim(),
        });
        if (isDuplicateFullName) {
          return res.status(200).json({
            status: false,
            message:
              "The provided channelName is already in use. Please choose a different one.",
          });
        }

        user.fullName = req.body.fullName
          ? req.body.fullName.trim()
          : user.fullName; //channelName
      }

      user.descriptionOfChannel = req.body.descriptionOfChannel
        ? req.body.descriptionOfChannel
        : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink
        ? req.body.instagramLink
        : user.socialMediaLinks.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink
        ? req.body.facebookLink
        : user.socialMediaLinks.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink
        ? req.body.twitterLink
        : user.socialMediaLinks.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink
        ? req.body.websiteLink
        : user.socialMediaLinks.websiteLink;

      await user.save();

      return res.status(200).json({ status: true, message: "Success", user });
    } else {
      return res.status(500).json({
        status: false,
        message: "isChannel must be passed true or false.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update profile of the user (when user login or signUp)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by the admin." });
    }

    if (req?.body?.image) {
      console.log("req?.body?.image: ", req?.body?.image);
      console.log("old user image: ", user?.image);

      //delete the old image from digitalOcean Spaces
      const urlParts = user?.image?.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      user.image = req?.body?.image ? req?.body?.image : user?.image;
      console.log("updated user image: ", user?.image);
    }

    if (req.body.fullName && req.body.fullName !== user.fullName) {
      // Check if the new channelName is different from the current one
      const isDuplicateFullName = await User.findOne({
        fullName: req.body.fullName.trim(),
      });
      if (isDuplicateFullName) {
        return res.status(200).json({
          status: false,
          message:
            "The provided channelName is already in use. Please choose a different one.",
        });
      }

      user.fullName = req.body.fullName
        ? req.body.fullName.trim()
        : user.fullName; //channelName
    }

    user.nickName = req.body.nickName ? req.body.nickName : user.nickName;
    user.gender = req.body.gender ? req.body.gender : user.gender;
    user.age = req.body.age ? req.body.age : user.age;
    user.mobileNumber = req.body.mobileNumber
      ? req.body.mobileNumber
      : user.mobileNumber;
    user.country = req.body.country ? req.body.country : user.country;
    user.ipAddress = req.body.ipAddress ? req.body.ipAddress : user.ipAddress;
    user.descriptionOfChannel = req.body.descriptionOfChannel
      ? req.body.descriptionOfChannel
      : user.descriptionOfChannel;

    user.socialMediaLinks.instagramLink = req.body.instagramLink
      ? req.body.instagramLink
      : user.socialMediaLinks.instagramLink;
    user.socialMediaLinks.facebookLink = req.body.facebookLink
      ? req.body.facebookLink
      : user.socialMediaLinks.facebookLink;
    user.socialMediaLinks.twitterLink = req.body.twitterLink
      ? req.body.twitterLink
      : user.socialMediaLinks.twitterLink;
    user.socialMediaLinks.websiteLink = req.body.websiteLink
      ? req.body.websiteLink
      : user.socialMediaLinks.websiteLink;

    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "Success", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get user profile who login
exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({
      _id: req.query.userId,
      isActive: true,
    }).populate("plan.premiumPlanId wallet");
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by the admin." });
    }

    if (user.plan.planStartDate !== null && user.plan.premiumPlanId !== null) {
      console.log("Check plan in get user profile API");

      const [updateUser, monetizationUpdateUser] = await Promise.all([
        checkPlan(user._id),
        !user.isMonetization
          ? monetizationEnabled(user._id)
          : Promise.resolve(),
      ]);

      if (!user.isMonetization) {
        console.log(
          "Check monetization with checkPlan function in get user profile API"
        );
        console.log(
          "monetizationUpdateUser isMonetization",
          monetizationUpdateUser.isMonetization
        );

        updateUser.isMonetization = monetizationUpdateUser.isMonetization; //Merge the updates from both functions
      }

      return res.status(200).json({
        status: true,
        message: "Profile of the user updated by admin!",
        user: updateUser,
      });
    }

    if (!user.isMonetization) {
      console.log("check monetization in get user profile API");

      const updateUser = await monetizationEnabled(user._id);
      return res.status(200).json({
        status: true,
        message: "finally, profile of the user get by admin!",
        user: updateUser,
      });
    }

    return res.status(200).json({
      status: true,
      message: "finally, profile of the user get by admin!",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (req.body.oldPass || req.body.newPass || req.body.confirmPass) {
      User.findOne({ _id: req.user._id }).exec(async (err, user) => {
        if (err) {
          return res.status(200).json({ status: false, message: err.message });
        } else {
          if (cryptr.decrypt(user.password) !== req.body.password) {
            return res.status(200).json({
              status: false,
              message: "Oops ! Password doesn't match!!",
            });
          }

          if (req.body.newPass !== req.body.confirmPass) {
            return res.status(200).json({
              status: false,
              message:
                "Oops ! New Password and Confirm Password doesn't match!!",
            });
          }

          const hash = cryptr.encrypt(req.body.newPass);

          await User.updateOne(
            { _id: req.user._id },
            { $set: { password: hash } }
          ).exec((error, updated) => {
            if (error) {
              return res.status(200).json({
                status: false,
                message: error.message,
              });
            } else {
              return res.status(200).json({
                status: true,
                message: "Password changed Successfully!",
              });
            }
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body || !req.body.newPassword || !req.body.confirmPassword)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = cryptr.encrypt(req.body.newPassword);
      await user.save();

      user.password = await cryptr.decrypt(user.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!!",
        user,
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Password does not matched!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get particular channel's details (home)
exports.detailsOfChannel = async (req, res, next) => {
  try {
    if (
      !req.query.channelId ||
      !req.query.userId ||
      !req.query.start ||
      !req.query.limit
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const channelId = req.query.channelId.toString();

    const [
      channel,
      user,
      totalVideosOfChannel,
      isSubscribedChannel,
      totalSubscribers,
      data,
    ] = await Promise.all([
      User.findOne({ channelId: channelId }),
      User.findOne({ _id: userId, isActive: true }),
      Video.countDocuments({ channelId: channelId }),
      UserWiseSubscription.findOne({ userId: userId, channelId: channelId }),
      UserWiseSubscription.countDocuments({ channelId: channelId }),

      Video.aggregate([
        {
          $match: {
            channelId: channelId,
            scheduleType: 2,
          },
        },
        {
          $lookup: {
            from: "watchhistories",
            localField: "_id",
            foreignField: "videoId",
            as: "views",
          },
        },
        {
          $lookup: {
            from: "savetowatchlaters",
            let: { videoId: "$_id", userId: userId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$videoId", "$$videoId"] },
                      { $eq: ["$userId", "$$userId"] },
                    ],
                  },
                },
              },
            ],
            as: "isSaveToWatchLater",
          },
        },
        {
          $project: {
            title: 1,
            videoType: 1,
            videoTime: 1,
            videoUrl: 1,
            videoImage: 1,
            channelId: 1,
            createdAt: 1,
            views: { $size: "$views" },
            isSaveToWatchLater: {
              $cond: [
                { $eq: [{ $size: "$isSaveToWatchLater" }, 0] },
                false,
                true,
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    const followObject = await followsModel
      .findOne({ email: channel.email })
      .lean();

    if (!followObject) {
      return res
        .status(400)
        .json({ status: false, message: "Followers Object is Corrupt." });
    }

    const isFollowing = followObject.followers.includes(user.email);

    let followingCount = followObject.following.length;
    let followerCount = followObject.followers.length;

    if (!channel) {
      return res
        .status(200)
        .json({ status: false, message: "channel does not found!" });
    }

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by admin!" });
    }

    const [isSubscribed, channelName, channelImage] = await Promise.all([
      isSubscribedChannel ? true : false,
      channel.fullName,
      channel.image,
    ]);

    let now = dayjs();
    const channelData = data?.map((data) => ({
      ...data,
      time:
        now.diff(data.createdAt, "minute") === 0
          ? "Just Now"
          : now.diff(data.createdAt, "minute") <= 60 &&
            now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") >= 365
            ? Math.floor(now.diff(data.createdAt, "day") / 365) + " years ago"
            : now.diff(data.createdAt, "day") >= 30
            ? Math.floor(now.diff(data.createdAt, "day") / 30) + " months ago"
            : now.diff(data.createdAt, "day") >= 7
            ? Math.floor(now.diff(data.createdAt, "day") / 7) + " weeks ago"
            : now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
    }));

    return res.status(200).json({
      status: true,
      message: "finally, get particular channel's details.",
      totalVideosOfChannel: totalVideosOfChannel,
      totalSubscribers: totalSubscribers,
      isSubscribed: isSubscribed,
      channelName: channelName,
      isFollowing: isFollowing,
      channelEmail: channel.email,
      channelImage: channelImage,
      followerCount: followerCount,
      followingCount: followingCount,
      detailsOfChannel: channelData.length > 0 ? channelData : [],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular's channel's videoType wise videos (videos, shorts) (your videos)
exports.videosOfChannel = async (req, res) => {
  try {
    if (
      !req.query.channelId ||
      !req.query.videoType ||
      !req.query.start ||
      !req.query.limit
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const [channel, data] = await Promise.all([
      User.findOne({ channelId: req.query.channelId }),

      Video.aggregate([
        {
          $match: {
            channelId: req.query.channelId,
            videoType: Number(req.query.videoType),
            isActive: true,
            scheduleType: 2,
          },
        },
        {
          $lookup: {
            from: "watchhistories",
            localField: "_id",
            foreignField: "videoId",
            as: "views",
          },
        },
        {
          $project: {
            title: 1,
            videoType: 1,
            videoTime: 1,
            videoUrl: 1,
            videoImage: 1,
            channelId: 1,
            createdAt: 1,
            views: { $size: "$views" },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!channel) {
      return res
        .status(200)
        .json({ status: false, message: "channel does not found!" });
    }

    let now = dayjs();
    const videosTypeWiseOfChannel = data.map((data) => ({
      ...data,
      time:
        now.diff(data.createdAt, "minute") === 0
          ? "Just Now"
          : now.diff(data.createdAt, "minute") <= 60 &&
            now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") >= 365
            ? Math.floor(now.diff(data.createdAt, "day") / 365) + " years ago"
            : now.diff(data.createdAt, "day") >= 30
            ? Math.floor(now.diff(data.createdAt, "day") / 30) + " months ago"
            : now.diff(data.createdAt, "day") >= 7
            ? Math.floor(now.diff(data.createdAt, "day") / 7) + " weeks ago"
            : now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
    }));

    return res.status(200).json({
      status: true,
      message: "finally, get particular channel's videos or shorts.",
      videosTypeWiseOfChannel:
        videosTypeWiseOfChannel.length > 0 ? videosTypeWiseOfChannel : [],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular's channel's playLists (another or own channel's playlist)
exports.playListsOfChannel = async (req, res, next) => {
  try {
    if (!req.query.channelId || !req.query.start || !req.query.limit) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const [channel, data] = await Promise.all([
      User.findOne({ channelId: req.query.channelId }),

      PlayList.aggregate([
        {
          $match: {
            channelId: req.query.channelId,
          },
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
          $project: {
            channelId: 1,
            userId: 1,
            playListName: 1,
            playListType: 1,
            channelName: "$channel.fullName",
            videoId: "$video._id",
            videoTitle: "$video.title",
            videoUrl: "$video.videoUrl",
            videoImage: "$video.videoImage",
            videoTime: "$video.videoTime",
          },
        },
        {
          $group: {
            _id: "$_id",
            channelId: { $first: "$channelId" },
            userId: { $first: "$userId" },
            playListName: { $first: "$playListName" },
            playListType: { $first: "$playListType" },
            channelName: { $first: "$channelName" },
            videos: {
              $push: {
                videoId: "$videoId",
                videoName: "$videoTitle",
                videoUrl: "$videoUrl",
                videoImage: "$videoImage",
                videoTime: "$videoTime",
              },
            },
            totalVideo: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!channel) {
      return res
        .status(200)
        .json({ status: false, message: "channel does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "get particular's channel's playLists.",
      playListsOfChannel: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular channel's about
exports.aboutOfChannel = async (req, res) => {
  try {
    if (!req.query.channelId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const [channel, totalViewsOfthatChannelVideos] = await Promise.all([
      User.findOne({ channelId: req.query.channelId }).select(
        "fullName descriptionOfChannel socialMediaLinks date country channelId"
      ),
      WatchHistory.countDocuments({ videoChannelId: req.query.channelId }),
    ]);

    if (!channel) {
      return res
        .status(200)
        .json({ status: false, message: "channel does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "finally, get particular channel's details!",
      aboutOfChannel: { channel, totalViewsOfthatChannelVideos },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//search channel for user
exports.searchChannel = async (req, res) => {
  try {
    if (!req.body.searchString || !req.body.userId) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details!",
      });
    }

    const [channel, user] = await Promise.all([
      User.find({ fullName: { $regex: req.body.searchString, $options: "i" } }),
      User.findOne({ _id: req.body.userId, isActive: true }),
    ]);

    if (!channel) {
      return res
        .status(200)
        .json({ status: false, message: "channel does not found!" });
    }

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by admin!" });
    }

    if (req.body.searchString) {
      const response = await Promise.all([
        User.aggregate([
          {
            $match: {
              channelId: { $ne: null },
              fullName: { $regex: req.body.searchString, $options: "i" },
            },
          },
          {
            $lookup: {
              from: "userwisesubscriptions",
              let: {
                channelId: "$channelId",
                userId: user._id,
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$channelId", "$$channelId"] },
                        { $eq: ["$userId", "$$userId"] },
                      ],
                    },
                  },
                },
              ],
              as: "isSubscribed",
            },
          },
          {
            $lookup: {
              from: "videos",
              let: {
                channelId: "$channelId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$channelId", "$$channelId"],
                    },
                  },
                },
              ],
              as: "totalVideos",
            },
          },
          {
            $lookup: {
              from: "userwisesubscriptions",
              localField: "channelId",
              foreignField: "channelId",
              as: "totalSubscribers",
            },
          },
          {
            $project: {
              channelId: 1,
              fullName: 1,
              image: 1,
              isSubscribed: {
                $cond: [{ $eq: [{ $size: "$isSubscribed" }, 0] }, false, true],
              },
              totalVideos: { $size: "$totalVideos" },
              totalSubscribers: { $size: "$totalSubscribers" },
            },
          },
        ]),
      ]);

      return res
        .status(200)
        .json({ status: true, message: "Success!!", searchData: response[0] });
    } else if (req.body.searchString === "") {
      return res
        .status(200)
        .json({ status: true, message: "No data found!!", searchData: [] });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
