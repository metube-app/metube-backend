//Mongoose
const mongoose = require("mongoose");

//Setting Schema
const settingSchema = new mongoose.Schema(
  {
    googlePlaySwitch: { type: Boolean, default: false },

    stripeSwitch: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "STRIPE PUBLISHABLE KEY" },
    stripeSecretKey: { type: String, default: "STRIPE SECRET KEY" },

    razorPaySwitch: { type: Boolean, default: false },
    razorPayId: { type: String, default: "RAZOR PAY ID" },
    razorSecretKey: { type: String, default: "RAZOR SECRET KEY" },

    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    privacyPolicyText: { type: String, default: "PRIVACY POLICY TEXT" },

    zegoAppId: { type: String, default: "ZEGO APP ID" },
    zegoAppSignIn: { type: String, default: "ZEGO APP SIGN IN" },

    adminCommissionOfPaidChannel: { type: Number, default: 0 }, //that value always in percentage
    adminCommissionOfPaidVideo: { type: Number, default: 0 }, //that value always in percentage
    durationOfShorts: { type: Number, default: 0 }, //that value always save in millisecond

    currency: { type: mongoose.Schema.Types.ObjectId, ref: "Currency", default: null },

    //withdrawal setting
    minWithdrawalRequestedAmount: { type: Number, min: 0, default: 0 },
    earningPerHour: { type: Number, min: 0, default: 0 }, //earning with default currency

    //monetization setting
    isMonetization: { type: Boolean, default: false },
    minWatchTime: { type: Number, default: 0 }, //that value always in hours
    minSubScriber: { type: Number, default: 0 },
    adDisplayIndex: { type: Number, default: 0 }, //it represents the index at which ads should be displayed
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
