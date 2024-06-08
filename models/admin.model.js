const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    image: { type: String, default: "" },
    purchaseCode: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
