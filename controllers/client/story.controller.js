const followsModel = require("../../models/follows.model");
const storyModel = require("../../models/story.model");
const userModel = require("../../models/user.model");
const { uploadObjectsToS3 } = require("../../util/awsFunction");

exports.storyUpload = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!req.body?.folderStructure || !req.body?.keyName) {
      return res
        .status(400)
        .json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!req?.file) {
      return res
        .status(400)
        .json({ status: false, message: "Please upload a valid files." });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserID not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const storyObj = await storyModel.findOne({ userId: user._id });

    await uploadObjectsToS3({
      folderStructure: req.body.folderStructure,
      keyName: req.body.keyName,
      filePath: req.file.path,
    });

    const url = `${process?.env?.endpoint}/${req.body.folderStructure}/${req.body.keyName}`;

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + 24 * 60 * 60 * 1000);

    storyObj.stories.push({ expiresAt: expiresAt, type: type, link: url });

    await storyObj.save();
    return res
      .status(200)
      .json({ status: true, message: "Saved your story successfully." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getFollowerStories = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserID not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const storyObj = await storyModel.findOne({ userId: user._id });

    const followObj = await followsModel.findOne({ email: user.email });

    const following = followObj.following;

    const now = new Date();
    const futureDate = new Date();
    futureDate.setTime(now.getTime() + 24 * 60 * 60 * 1000);

    const posts = storyObj.stories
      .filter((story) => new Date(story.expiresAt) <= futureDate)
      .map((story) => {
        return {
          story_id: story._id,
          id: story._id,
          user_id: user._id,
          url: story.link,
          type: story.type,
          create_date: story.createdAt,
          username: user.fullName,
          profile_pic: user.image,
          story_image: null,
        };
      });

    following.forEach(async (flw) => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setTime(now.getTime() + 24 * 60 * 60 * 1000);

      const otherUser = await userModel.findOne({ email: flw });

      const otherStoryObj = await storyModel.findOne({ userId: otherUser._id });

      otherStoryObj.stories
        .filter((story) => new Date(story.expiresAt) <= futureDate)
        .forEach((story) => {
          posts.push({
            story_id: story._id,
            id: story._id,
            user_id: otherUser._id,
            url: story.link,
            type: story.type,
            create_date: story.createdAt,
            username: otherUser.fullName,
            profile_pic: otherUser.image,
            story_image: null,
          });
        });
    });

    const response = {
      status: "success",
      msg: "Story Successfully Retrieved",
      user_id: user._id,
      profile_pic: user.image,
      post: posts,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getStories = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserID not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const storyObj = await storyModel.findOne({ userId: user._id });

    const now = new Date();
    const futureDate = new Date();
    futureDate.setTime(now.getTime() + 24 * 60 * 60 * 1000);

    const posts = storyObj.stories
      .filter((story) => new Date(story.expiresAt) <= futureDate)
      .map((story) => {
        return {
          story_id: story._id,
          id: story._id,
          user_id: user._id,
          url: story.link,
          type: story.type,
          create_date: story.createdAt,
          username: user.fullName,
          profile_pic: user.image,
          story_image: null,
        };
      });

    const response = {
      status: "success",
      msg: "Story Successfully Retrieved",
      user_id: user._id,
      profile_pic: user.image,
      post: posts,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
