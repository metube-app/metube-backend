const mongoose = require("mongoose");

const liveUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    image: { type: String, default: "" },
    channel: { type: String, default: "" },
    view: { type: Number, default: 0 },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    liveHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveHistory" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

liveUserSchema.index({ userId: 1 });
liveUserSchema.index({ liveHistoryId: 1 });

module.exports = mongoose.model("LiveUser", liveUserSchema);
