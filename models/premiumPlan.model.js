const mongoose = require("mongoose");

const premiumPlanSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    validity: { type: Number, default: 0 },
    validityType: { type: String, default: null },
    productKey: { type: String, default: null },
    planBenefit: { type: Array },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("PremiumPlan", premiumPlanSchema);
