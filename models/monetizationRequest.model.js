const mongoose = require("mongoose");

const { MONETIZATIONREQUEST_STATUS } = require("../types/constant");

const monetizationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    channelId: { type: String, default: "" }, //channelId of the particular that user
    channelName: { type: String, default: "" }, //channelName of the particular that user
    totalWatchTime: { type: Number, default: 0 }, //total watch time of the all videos of the particular channel at request time
    status: { type: Number, default: 1, enum: MONETIZATIONREQUEST_STATUS },
    requestDate: { type: String, default: "" },
    reason: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("MonetizationRequest", monetizationRequestSchema);
