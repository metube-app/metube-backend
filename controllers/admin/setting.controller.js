const Setting = require("../../models/setting.model");

//create Setting
exports.store = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(200).json({ status: false, message: "oops ! Invalid details." });
    }

    const setting = new Setting();

    setting.privacyPolicyLink = req.body.privacyPolicyLink;
    await setting.save();

    return res.status(200).json({ status: true, message: "Success", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update Setting
exports.update = async (req, res) => {
  try {
    if (!req.query.settingId) {
      return res.status(200).json({ status: false, message: "SettingId must be required." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.privacyPolicyText = req.body.privacyPolicyText ? req.body.privacyPolicyText : setting.privacyPolicyText;

    setting.zegoAppId = req.body.zegoAppId ? req.body.zegoAppId : setting.zegoAppId;
    setting.zegoAppSignIn = req.body.zegoAppSignIn ? req.body.zegoAppSignIn : setting.zegoAppSignIn;

    setting.stripePublishableKey = req.body.stripePublishableKey ? req.body.stripePublishableKey : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ? req.body.stripeSecretKey : setting.stripeSecretKey;

    setting.razorPayId = req.body.razorPayId ? req.body.razorPayId : setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey ? req.body.razorSecretKey : setting.razorSecretKey;

    setting.adminCommissionOfPaidChannel = parseInt(req.body.adminCommissionOfPaidChannel)
      ? parseInt(req.body.adminCommissionOfPaidChannel)
      : setting.adminCommissionOfPaidChannel;
    setting.adminCommissionOfPaidVideo = parseInt(req.body.adminCommissionOfPaidVideo)
      ? parseInt(req.body.adminCommissionOfPaidVideo)
      : setting.adminCommissionOfPaidVideo;
    setting.durationOfShorts = parseInt(req.body.durationOfShorts) ? parseInt(req.body.durationOfShorts) : setting.durationOfShorts;

    setting.minWithdrawalRequestedAmount = parseInt(req.body.minWithdrawalRequestedAmount)
      ? parseInt(req.body.minWithdrawalRequestedAmount)
      : setting.minWithdrawalRequestedAmount;

    setting.earningPerHour = req.body.earningPerHour ? parseInt(req.body.earningPerHour) : setting.earningPerHour;

    setting.minWatchTime = req.body.minWatchTime ? parseInt(req.body.minWatchTime) : setting.minWatchTime;
    setting.minSubScriber = req.body.minSubScriber ? parseInt(req.body.minSubScriber) : setting.minSubScriber;
    setting.adDisplayIndex = req.body.adDisplayIndex ? parseInt(req.body.adDisplayIndex) : setting.adDisplayIndex;

    await setting.save();

    return res.status(200).json({
      status: true,
      message: "finally, Setting has been Updated by admin.",
      setting: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get setting
exports.index = async (req, res) => {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    return res.status(200).json({ status: true, message: "Success", setting: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.settingId || !req.query.type) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (req.query.type === "stripe") {
      setting.stripeSwitch = !setting.stripeSwitch;
    } else if (req.query.type === "razorPay") {
      setting.razorPaySwitch = !setting.razorPaySwitch;
    } else if (req.query.type === "googlePlaySwitch") {
      setting.googlePlaySwitch = !setting.googlePlaySwitch;
    } else if (req.query.type === "monetization") {
      setting.isMonetization = !setting.isMonetization;
    } else {
      return res.status(200).json({ status: false, message: "type passed must be valid." });
    }

    await setting.save();

    return res.status(200).json({ status: true, message: "Success", setting: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
