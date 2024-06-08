const WithDrawRequest = require("../../models/withDrawRequest.model");

//import model
const Setting = require("../../models/setting.model");
const User = require("../../models/user.model");

//uniqueId
function generateUniqueId() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Withdraw request made by particular user
exports.createWithdrawRequest = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.requestAmount || !req.body.paymentGateway || !req.body.paymentDetails) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const uniqueId = generateUniqueId();

    const [user, setting] = await Promise.all([
      User.findOne({ _id: req.body.userId, isActive: true }),
      Setting.findOne().sort({ createdAt: -1 }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!user.isChannel) {
      return res
        .status(200)
        .json({ status: false, message: "channel of that user does not created please firstly create channel of that user!" });
    }

    if (req.body.requestAmount > user.totalWithdrawableAmount) {
      return res.status(200).json({
        status: false,
        message: "The user does not have sufficient funds to make the withdrawal.",
      });
    }

    if (!setting || !setting.earningPerHour) {
      return res.status(200).json({
        status: false,
        message: "earningPerHour not configured in settings!",
      });
    }

    if (req.body.requestAmount < setting.minWithdrawalRequestedAmount) {
      return res.status(200).json({
        status: false,
        message: "Oops ! withdrawal request amount must be greater than specified by the admin.",
      });
    }

    const [pendingExistRequest, declinedExistRequest] = await Promise.all([
      WithDrawRequest.findOne({ userId: user._id, status: 1 }),
      WithDrawRequest.findOne({ userId: user._id, status: 3 }),
    ]);

    console.log("pendingExistRequest ", pendingExistRequest);
    console.log("declinedExistRequest ", declinedExistRequest);

    if (pendingExistRequest) {
      return res
        .status(200)
        .json({ status: true, message: "withdrawal request already send by you to admin.", withDrawRequest: pendingExistRequest });
    } else if (declinedExistRequest) {
      await declinedExistRequest.deleteOne();

      const earningPerHour = setting.earningPerHour;
      const hoursOfPayment = parseFloat(req.body.requestAmount) / earningPerHour;
      const minutesToCut = hoursOfPayment * 60;

      const [saveUser, saveRequest] = await Promise.all([
        User.updateOne(
          { _id: req.body.userId },
          {
            $inc: {
              totalCurrentWatchTime: -minutesToCut,
              totalWithdrawableAmount: -Number(req.body.requestAmount),
            },
          }
        ),

        WithDrawRequest.create({
          userId: user._id,
          channelId: user.channelId,
          channelName: user.fullName,
          requestAmount: req.body.requestAmount,
          totalWatchTime: minutesToCut,
          paymentGateway: req.body.paymentGateway,
          paymentDetails: req.body.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
          uniqueId: uniqueId,
          requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "withdrawal request already declined by admin and new request has been created.",
        withDrawRequest: saveRequest,
      });
    } else {
      const earningPerHour = setting.earningPerHour;
      const hoursOfPayment = parseFloat(req.body.requestAmount) / earningPerHour;
      const minutesToCut = hoursOfPayment * 60;

      const [saveUser, saveRequest] = await Promise.all([
        User.updateOne(
          { _id: req.body.userId },
          {
            $inc: {
              totalCurrentWatchTime: -minutesToCut,
              totalWithdrawableAmount: -Number(req.body.requestAmount),
            },
          }
        ),

        WithDrawRequest.create({
          userId: user._id,
          channelId: user.channelId,
          channelName: user.fullName,
          requestAmount: req.body.requestAmount,
          totalWatchTime: minutesToCut,
          paymentGateway: req.body.paymentGateway,
          paymentDetails: req.body.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
          uniqueId: uniqueId,
          requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      ]);

      return res.status(200).json({ status: true, message: "finally, withdrawal request send to admin.", withDrawRequest: saveRequest });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get all withdraw request by particular user
exports.getWithdrawRequests = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

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

    const [user, WithDrawRequests] = await Promise.all([
      User.findOne({ _id: req.query.userId, isActive: true }),
      WithDrawRequest.find({ userId: req.query.userId, ...dateFilterQuery }).sort({ createdAt: -1 }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!WithDrawRequests) {
      return res.status(200).json({ status: false, message: "WithDrawRequests does not found for that user." });
    }

    return res.status(200).json({
      status: true,
      message: "finally, get all withdraw requests for that user.",
      WithDrawRequests: WithDrawRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
