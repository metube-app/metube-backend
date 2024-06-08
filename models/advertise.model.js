const mongoose = require("mongoose");

const advertiseSchema = new mongoose.Schema(
  {
    isGoogle: { type: Boolean, default: false },
    google: {
      interstitial: { type: String, default: "" },
      native: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Advertise", advertiseSchema);
