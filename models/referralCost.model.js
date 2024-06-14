const mongoose = require("mongoose");

const referralCostSchema = new mongoose.Schema({
  referralCost : {type : Number, default : 0},
  referredCost : {type : Number, default : 0},
  documentId : {type : String, default : "referralCost"}
});

module.exports = mongoose.model("referralCost", referralCostSchema);