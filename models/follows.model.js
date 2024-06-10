const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  email : {type : String},
  followers : {type : Array, default : []},
  following : {type : Array, default : []}
}, {
  timestamps : true
});

module.exports = mongoose.model("Follows", followSchema);