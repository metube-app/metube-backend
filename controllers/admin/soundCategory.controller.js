const SoundCategory = require("../../models/soundCategory.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create soundCategory
exports.create = async (req, res) => {
  try {
    if (!req.body.name || !req.body.image) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const soundCategory = new SoundCategory();

    soundCategory.name = req.body.name;
    soundCategory.image = req.body.image;
    await soundCategory.save();

    return res.status(200).json({
      status: true,
      message: "finally, soundCategory created by admin!",
      soundCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update soundCategory
exports.update = async (req, res) => {
  try {
    if (!req.query.soundCategoryId) {
      return res.status(200).json({ status: false, message: "soundCategoryId must be required!!" });
    }

    const soundCategory = await SoundCategory.findOne({ _id: req.query.soundCategoryId, isActive: true });
    if (!soundCategory) {
      return res.status(200).json({ status: false, message: "soundCategory does not found!!" });
    }

    if (req.body.image) {
      console.log("req?.body?.image: ", req?.body?.image);
      console.log("old soundCategory image: ", soundCategory.image);

      //delete the old image from digitalOcean Spaces
      const urlParts = soundCategory.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      soundCategory.image = req.body.image ? req.body.image : soundCategory.image;
      console.log("updated soundCategory image: ", soundCategory.image);
    }

    soundCategory.name = req.body.name ? req.body.name : soundCategory.name;
    await soundCategory.save();

    return res.status(200).json({
      status: true,
      message: "finally, soundCategory updated by admin!",
      soundCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete soundCategory
exports.destroy = async (req, res) => {
  try {
    if (!req.query.soundCategoryId) {
      return res.status(200).json({ status: false, message: "soundCategoryId must be required!" });
    }

    const soundCategoryIds = req.query.soundCategoryId.split(",");

    const SoundCategorys = await Promise.all(soundCategoryIds.map((Id) => SoundCategory.findById(Id)));
    if (SoundCategorys.some((soundCategory) => !soundCategory)) {
      return res.status(200).json({ status: false, message: "No SoundCategorys found with the provided IDs." });
    }

    //delete image from DigitalOcean Spaces
    for (const soundCategoryId of soundCategoryIds) {
      const soundCategory = await SoundCategory.findById(soundCategoryId);
      if (soundCategory?.image) {
        const urlParts = soundCategory?.image.split("/");
        const keyName = urlParts.pop();
        const folderStructure = urlParts.slice(3).join("/");

        await deleteFromSpace({ folderStructure, keyName });
      }
    }

    const result = await SoundCategory.deleteMany({ _id: { $in: soundCategoryIds } });
    if (result.deletedCount > 0) {
      return res.status(200).json({ status: true, message: "finally, SoundCategorys has been deleted by admin!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get all soundCategory
exports.get = async (req, res) => {
  try {
    const soundCategory = await SoundCategory.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "finally, get all soundCategory by admin!", soundCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};
