const redeemRequestModel = require("../../models/redeemRequest.model");
const userModel = require("../../models/user.model");
const walletModel = require("../../models/wallet.model");

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

exports.submitBankDetails = async (req, res) => {
  try {
    const { userId, ifsc, accountHolder, accountNumber, bankBranch } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID not sent.",
      });
    }

    if (!ifsc || !accountHolder || !accountNumber || !bankBranch) {
      return res.status(400).json({
        message: "Bank Details not sent",
      });
    }

    const user = await userModel.findById(req.body.userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const wallet = await walletModel.findById(user.wallet);

    wallet.bankDetails = {
      ifsc,
      accountHolder,
      accountNumber,
      bankBranch,
    };

    await wallet.save();

    return res.status(200).json({ status: true, message: "Saved." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.redeemRequest = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found." });
    }

    if (!amount) {
      return res.status(400).json({ message: "Amount not sent." });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const wallet = await walletModel.findById(user.wallet);

    if (!wallet) {
      return res.status(400).json({ message: "Wallet not found." });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Amount higher than balance." });
    }

    const redeemRequest = await redeemRequestModel.create({
      redeemAmount: amount,
      walletId: wallet._id,
      userId: user._id,
    });

    return res.status(200).json({ result : redeemRequest, message : "Request Placed" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};
