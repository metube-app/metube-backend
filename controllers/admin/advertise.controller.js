const Advertise = require("../../models/advertise.model");

//create advertise
exports.store = async (req, res) => {
  try {
    if (!req.query.googleInterstitial || !req.query.googleNative) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const advertise = new Advertise();

    advertise.google.interstitial = req.query.googleInterstitial;
    advertise.google.native = req.query.googleNative;
    await advertise.save();

    return res.status(200).json({
      status: true,
      message: "finally advertise create Successfully",
      advertise,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update advertise
exports.update = async (req, res) => {
  try {
    const adId = req.query.adId;
    if (!adId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const advertise = await Advertise.findById(adId);
    if (!advertise) {
      return res.status(200).json({ status: false, message: "advertise does not found." });
    }

    advertise.google.interstitial = req.body.googleInterstitial ? req.body.googleInterstitial : advertise.google.interstitial;
    advertise.google.native = req.body.googleNative ? req.body.googleNative : advertise.google.native;

    await advertise.save();

    return res.status(200).json({
      status: true,
      message: "finally advertise updated Successfully",
      advertise,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//get advertise
exports.get = async (req, res) => {
  try {
    const advertise = await Advertise.findOne().sort({ createdAt: -1 });
    if (!advertise) {
      return res.status(200).json({ status: false, message: "advertise does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "finally advertise fetch Successfully",
      advertise,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//handle activation of the switch
exports.handleSwitchForAd = async (req, res) => {
  try {
    const adId = req.query.adId;
    if (!adId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const advertise = await Advertise.findById(adId);
    if (!advertise) {
      return res.status(200).json({ status: false, message: "advertise does not found." });
    }

    advertise.isGoogle = !advertise.isGoogle;
    await advertise.save();

    return res.status(200).json({
      status: true,
      message: "finally advertise updated Successfully",
      advertise,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
