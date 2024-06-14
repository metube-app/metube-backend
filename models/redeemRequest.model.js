const mongoose = require("mongoose");

const redeemRequestSchema = new mongoose.Schema({
  walletId : {type : mongoose.Schema.Types.ObjectId, ref : "Wallet"},
  redeemAmount : {type : Number, default : null},
  userId : { type : mongoose.Schema.Types.ObjectId, ref : "User"}
},{
  timestamps : true
});

module.exports = mongoose.model("redeemRequest", redeemRequestSchema);