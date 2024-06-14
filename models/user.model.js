const { LOGIN_TYPE } = require("../types/constant");

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "Andraw Ainsley" }, //channelName when set the channelName
    nickName: { type: String, default: "Danielle Steel" },
    email: { type: String, default: "AndrawUser123@gmail.com" },
    gender: { type: String, default: "Male" },
    age: { type: Number, default: 0 },
    mobileNumber: { type: String, default: null },
    image: { type: String, default: null },
    country: { type: String, default: null },
    ipAddress: { type: String, default: null },

    socialMediaLinks: {
      instagramLink: { type: String, default: "" },
      facebookLink: { type: String, default: "" },
      twitterLink: { type: String, default: "" },
      websiteLink: { type: String, default: "" },
    },

    channelId: { type: String, default: null },
    descriptionOfChannel: { type: String, default: null },
    isChannel: { type: Boolean, default: false },

    password: { type: String, default: null },
    uniqueId: { type: String, default: null },
    loginType: { type: Number, enum: LOGIN_TYPE }, //1.facebook 2.google 3.Apple 4.email-password 5.isLogin
    identity: { type: String, default: null },
    fcmToken: { type: String, default: null },
    date: { type: String, default: null },

    isPremiumPlan: { type: Boolean, default: true }, // has been set to true by default
    plan: {
      planStartDate: { type: String, default: null }, //premium plan start date
      planEndDate: { type: String, default: null }, //Premium plan end date
      premiumPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PremiumPlan",
        default: null,
      },
    },

    isAddByAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isReferred: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    channel: { type: String, default: null },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    liveHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveHistory",
      default: null,
    },

    totalWatchTime: { type: Number, default: 0 }, //that value always save in minutes for Monetization
    totalCurrentWatchTime: { type: Number, default: 0 }, //that value always save in minutes for Withdrawal

    totalWithdrawableAmount: { type: Number, default: 0 },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },

    isMonetization: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ createdAt: -1 });
userSchema.index({ isAddByAdmin: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isBlock: 1 });
userSchema.index({ liveHistoryId: 1 });

module.exports = mongoose.model("User", userSchema);
