const userModel = require("../../models/user.model");

exports.getWalletDetails = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({
        message: "User ID not sent.",
      });
    }

    const user = await userModel
      .findById(req.body.userId)
      .select("wallet")
      .populate("wallet");

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    return res.status(200).json({ wallet: user.wallet });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};
