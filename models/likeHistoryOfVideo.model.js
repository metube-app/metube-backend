const mongoose = require("mongoose");

const likeHistoryOfVideoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    likeOrDislike: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

likeHistoryOfVideoSchema.index({ userId: 1 });
likeHistoryOfVideoSchema.index({ videoId: 1 });
likeHistoryOfVideoSchema.index({ likeOrDislike: 1 });

module.exports = mongoose.model("LikeHistoryOfVideo", likeHistoryOfVideoSchema);
