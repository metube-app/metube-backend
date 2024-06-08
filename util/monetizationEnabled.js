//import model
const User = require("../models/user.model");
const Setting = require("../models/setting.model");
const UserWiseSubscription = require("../models/userWiseSubscription.model");
const WatchHistory = require("../models/watchHistory.model");

// Check if user meets the monetization criteria
const monetizationEnabled = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    console.log("Inside monetizationEnabled user =================", user._id);

    const settings = await Setting.findOne().sort({ createdAt: -1 });
    console.log("requried minWatchTime :    ", settings.minWatchTime);
    console.log("requried minSubScriber :    ", settings.minSubScriber);

    const subscriptions = await UserWiseSubscription.countDocuments({ channelId: user.channelId });
    console.log("total subscriptions:    ", subscriptions);

    const watchHistoryAggregate = await WatchHistory.aggregate([
      { $match: { videoChannelId: user.channelId } },
      {
        $group: {
          _id: null,
          totalWatchTime: { $sum: "$totalWatchTime" },
        },
      },
    ]);

    const totalWatchTime = watchHistoryAggregate.length > 0 ? watchHistoryAggregate[0].totalWatchTime : 0;
    const totalWatchTimeHours = totalWatchTime / 60; //Convert total watch time from minutes to hours
    console.log("totalWatchTimeHours:   ", totalWatchTimeHours);

    //Check if user meets the criteria
    const isMonetizationEnabled = totalWatchTimeHours >= settings.minWatchTime && subscriptions >= settings.minSubScriber;
    console.log("isMonetizationEnabled updated Inside:    ", isMonetizationEnabled);

    //Update isMonetization in the User model based on the result
    await User.updateOne({ _id: user._id }, { $set: { isMonetization: isMonetizationEnabled } });

    //return isMonetizationEnabled;

    const data = await User.findById(user._id).populate("plan.premiumPlanId", "amount validity validityType");
    return data;
  } catch (error) {
    console.error("Error in checking monetization eligibility:", error);
    throw error;
  }
};

module.exports = { monetizationEnabled };
