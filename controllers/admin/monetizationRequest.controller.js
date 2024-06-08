const MonetizationRequest = require("../../models/monetizationRequest.model");

//import model
const User = require("../../models/user.model");

//get all monetization requests
exports.getAllMonetizationRequests = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let typeQuery = {};
    if (req.query.type !== "All") {
      typeQuery.status = parseInt(req.query.type);
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

    const [total, request] = await Promise.all([
      MonetizationRequest.countDocuments({
        ...dateFilterQuery,
        ...typeQuery,
      }),

      MonetizationRequest.find({
        ...dateFilterQuery,
        ...typeQuery,
      })
        .populate("userId", "fullName nickName image")
        .skip((start - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, all monetization requests get by the admin.",
      total: total,
      request: request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//accept or decline monetization request
exports.handleMonetizationRequest = async (req, res) => {
  try {
    if (!req.query.monetizationRequestId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (req.query.type == 3 && !req.query.reason) {
      return res.status(200).json({ status: false, message: "Reason must be requried when request declined by the admin." });
    }

    const monetizationRequest = await MonetizationRequest.findById(req.query.monetizationRequestId);
    if (!monetizationRequest) {
      return res.status(200).json({ status: false, message: "Monetization request does not found!" });
    }

    const user = await User.findOne({ _id: monetizationRequest.userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (req.query.type == 2) {
      if (monetizationRequest.status == 2) {
        return res.status(200).json({ status: false, message: "Monetization request already accepted by the admin." });
      }

      if (monetizationRequest.status == 3) {
        return res.status(200).json({ status: false, message: "Monetization request already declined by the admin." });
      }

      await MonetizationRequest.updateOne({ _id: monetizationRequest._id }, { $set: { status: 2 } });

      return res.status(200).json({ status: true, message: "Monetization request accepted by the admin." });
    } else if (req.query.type == 3) {
      if (monetizationRequest.status == 3) {
        return res.status(200).json({ status: false, message: "Monetization request already declined by the admin." });
      }

      if (monetizationRequest.status == 2) {
        return res.status(200).json({ status: false, message: "Monetization request already accepted by the admin." });
      }

      await Promise.all([
        User.updateOne(
          { _id: monetizationRequest.userId },
          {
            $inc: {
              totalWatchTime: monetizationRequest.totalWatchTime,
            },
          }
        ),

        MonetizationRequest.updateOne({ _id: monetizationRequest._id }, { $set: { status: 3, reason: req.query.reason } }),
      ]);

      return res.status(200).json({ status: true, message: "Monetization request declined by the admin." });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
