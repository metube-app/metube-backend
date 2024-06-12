const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    bankDetails: {
      type: Object,
      default: {
        ifsc: "",
        accountNumber: "",
        accountHolder: "",
        bankBranch: "",
      },
    },
    balance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
