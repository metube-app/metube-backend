const Follow = require("../../models/follows.model");

exports.followPerson = async (req, res) => {
  try {
    if (!req.body.email || !req.body.followEmail) {
      return res
        .status(400)
        .json({ status: false, message: "Emails not sent." });
    }

    const followObj = await Follow.findOne({ email: req.body.email });
    const followedObj = await Follow.findOne({ email: req.body.followEmail });

    if (!followObj || !followedObj) {
      return res.status(400).json({ message: "Follower Objects not found" });
    }

    if (
      followObj.following.includes(req.body.followEmail) ||
      followedObj.followers.includes(req.body.email)
    ) {
      return res
        .status(400)
        .json({ message: "You already follow this person." });
    }
    followObj.following.push(req.body.followEmail);
    followedObj.followers.push(req.body.email);

    await followObj.save();
    await followedObj.save();

    return res.status(200).json({ message: "Successfully followed." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.unfollowPerson = async (req, res) => {
  try {
    if (!req.body.email || !req.body.followEmail) {
      return res
        .status(400)
        .json({ status: false, message: "Emails not sent." });
    }

    const followObj = await Follow.findOne({ email: req.body.email });
    const followedObj = await Follow.findOne({ email: req.body.followEmail });

    if (!followObj || !followedObj) {
      return res.status(400).json({ message: "Follower Objects not found" });
    }

    if (
      !followObj.following.includes(req.body.followEmail) ||
      !followedObj.followers.includes(req.body.email)
    ) {
      return res.status(400).json({ message: "You don't follow this person." });
    }

    followObj.following = followObj.following.filter(
      (mails) => mails !== req.body.followEmail
    );
    followedObj.followers = followedObj.followers.filter(
      (mails) => mails !== req.body.email
    );

    await followObj.save();
    await followedObj.save();

    return res.status(200).json({ message: "Successfully unfollowed." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};
