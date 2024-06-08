const { REPORT_TYPE } = require("../types/constant");

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    reportType: { type: Number, enum: REPORT_TYPE },
    videoType: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reportSchema.index({ userId: 1 });
reportSchema.index({ videoId: 1 });

module.exports = mongoose.model("Report", reportSchema);
