const mongoose = require("mongoose");

const videoCommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    recursiveCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "VideoComment", default: null },

    videoType: { type: Number },
    commentText: { type: String },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

videoCommentSchema.index({ userId: 1 });
videoCommentSchema.index({ videoId: 1 });
videoCommentSchema.index({ recursiveCommentId: 1 });

module.exports = mongoose.model("VideoComment", videoCommentSchema);
