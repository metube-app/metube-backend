const Setting = require("../../models/setting.model");

//get setting
exports.get = async (req, res) => {
  try {
    const setting = await Setting.findOne().populate("currency", "name symbol countryCode isDefault").sort({ createdAt: -1 });
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
