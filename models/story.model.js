const mongoose = require("mongoose");

const storyContentSchema = new mongoose.Schema({
  expiresAt: { 
    type: Date, 
    required: true 
  },
  link: { 
    type: String, 
    required: true 
  },
  type: {
    type: String
  }
},
{
  timestamps : true
});

const storySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  stories: { 
    type: [storyContentSchema], 
    default: []
  },
}, { timestamps: true });

module.exports = mongoose.model("Story", storySchema);
