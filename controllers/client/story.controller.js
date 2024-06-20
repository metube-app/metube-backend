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

exports.deleteStory = async (req, res) => {
  try {
    const {userId, url} = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserID not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const storyObj = await storyModel.findOne({userId : user._id});

    if(!storyObj){
      return res.status(400).json({ message : "No story object found."});
    }

    storyObj.stories = storyObj.stories.filter(story => story.link != url);

    await storyObj.save();

    return res.status(200).json({ message : "successfully deleted the story." });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
}

exports.getFollowerStories = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserID not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const followObj = await followsModel.findOne({ email: user.email });

    const following = [user.email, ...followObj.following];

    const responseObject = await Promise.all(
      following.map(async (flw) => {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setTime(now.getTime() + 24 * 60 * 60 * 1000);

        const otherUser = await userModel.findOne({ email: flw });

        const otherStoryObj = await storyModel.findOne({
          userId: otherUser._id,
        });

        const storyImages = otherStoryObj.stories
          .filter((story) => new Date(story.expiresAt) <= futureDate)
          .map((story) => {
            return {
              url: story.link,
              type: story.type,
              userId: otherUser._id.toString()
            };
          });

        return {
          story_id: otherStoryObj._id,
          id: otherStoryObj._id,
          user_id: otherUser._id,
          url: otherStoryObj.stories[0]?._id || "",
          type: "image",
          create_data: otherStoryObj.createdAt,
          username: otherUser.fullName,
          profile_pic: otherUser.image,
          story_image: storyImages,
        };
      })
    );

    const response = {
      status: "success",
      msg: "Story Successfully Retrieved",
      user_id: user._id,
      profile_pic: user.image,
      post: responseObject,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
