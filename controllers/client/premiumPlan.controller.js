const PremiumPlan = require("../../models/premiumPlan.model");

//import model
const User = require("../../models/user.model");
const PremiumPlanHistory = require("../../models/premiumPlanHistory.model");

//moment
const moment = require("moment");

//get all premiumPlan for user (isActive)
exports.index = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.find({ isActive: true }).sort({ validityType: 1, validity: 1 });

    return res.status(200).json({ status: true, message: "Success", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//when user purchase the premiumPlan create premiumPlan history by user
exports.createHistory = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.premiumPlanId || !req.body.paymentGateway)
      return res.json({
        status: false,
        message: "Oops ! Invalid details.",
      });

    const [user, premiumPlan] = await Promise.all([
      User.findOne({ _id: req.body.userId, isActive: true }),
      PremiumPlan.findById(req.body.premiumPlanId),
    ]);

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "user does not found.",
      });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!premiumPlan) {
      return res.status(200).json({
        status: false,
        message: "PremiumPlan does not found.",
      });
    }

    const currentDate = new Date();
    console.log("currentDate:   ", currentDate);

    let planEndDate = new Date(currentDate);

    if (premiumPlan.validityType === "month") {
      planEndDate.setMonth(currentDate.getMonth() + premiumPlan.validity);
    } else if (premiumPlan.validityType === "year") {
      planEndDate.setFullYear(currentDate.getFullYear() + premiumPlan.validity);
    }

    user.isPremiumPlan = true;
    user.plan.planStartDate = moment().toISOString();
    user.plan.planEndDate = moment(planEndDate).toISOString();
    user.plan.premiumPlanId = premiumPlan._id;

    const history = new PremiumPlanHistory();

    history.userId = user._id;
    history.premiumPlanId = premiumPlan._id;
    history.paymentGateway = req.body.paymentGateway; //(razorPay or stripe)
    history.date = moment().toISOString();

    await Promise.all([user.save(), history.save()]);

    return res.status(200).json({
      status: true,
      message: "when user purchase the premiumPlan created premiumPlan history!",
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get premiumPlanHistory of particular user (user)
exports.planHistoryOfUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const history = await PremiumPlanHistory.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "premiumplans",
          localField: "premiumPlanId",
          foreignField: "_id",
          as: "premiumPlan",
        },
      },
      {
        $unwind: {
          path: "$premiumPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          paymentGateway: 1,
          premiumPlanId: 1,
          userId: 1,

          fullName: "$user.fullName",
          nickName: "$user.nickName",
          image: "$user.image",
          planStartDate: "$user.plan.planStartDate",
          planEndDate: "$user.plan.planEndDate",

          amount: "$premiumPlan.amount",
          validity: "$premiumPlan.validity",
          validityType: "$premiumPlan.validityType",
          planBenefit: "$premiumPlan.planBenefit",
          //purchaseDate: "$date",
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
