const Withdraw = require("../../models/withdraw.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//store Withdraw
exports.store = async (req, res) => {
  try {
    if (!req?.body?.name || !req?.body?.details || !req?.body?.image) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const withdraw = new Withdraw();

    withdraw.name = req?.body?.name;
    withdraw.details = req?.body?.details?.split(",");
    withdraw.image = req?.body?.image;
    await withdraw.save();

    return res.status(200).json({
      status: true,
      message: "withdraw method created by admin!!",
      withdraw,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update Withdraw
exports.update = async (req, res) => {
  try {
    if (!req.query.withdrawId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      return res.status(200).json({ status: false, message: "withdraw does not found!!" });
    }

    if (req.body.image) {
      console.log("req.body in update withdraw: ", req.body);
      console.log("old image update withdraw: ", withdraw.image);

      //delete the old image from digitalOcean Spaces
      const urlParts = withdraw.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      withdraw.image = req?.body?.image ? req?.body?.image : withdraw.image;
    }

    withdraw.name = req?.body?.name ? req?.body?.name : withdraw.name;
    withdraw.details = req?.body?.details.toString() ? req?.body?.details.toString().split(",") : withdraw.details;
    await withdraw.save();

    return res.status(200).json({
      status: true,
      message: "withdraw method updated by admin!",
      withdraw,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete Withdraw
exports.delete = async (req, res) => {
  try {
    if (!req.query.withdrawId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      return res.status(200).json({ status: false, message: "withdraw does not found!!" });
    }

    //delete the old image from digitalOcean Spaces
    const urlParts = withdraw.image.split("/");
    const keyName = urlParts.pop(); //remove the last element
    const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

    await deleteFromSpace({ folderStructure, keyName });

    await withdraw.deleteOne();

    return res.status(200).json({ status: true, message: "withdraw method deleted by admin!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get Withdraw
exports.get = async (req, res) => {
  try {
    const withdraw = await Withdraw.find().sort({ createdAt: 1 });

    return res.status(200).json({ status: true, message: "finally, withdraw methods get by admin!", withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle isEnabled switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.withdrawId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      return res.status(200).json({ status: false, message: "Withdraw does not found!" });
    }

    withdraw.isEnabled = !withdraw.isEnabled;
    await withdraw.save();

    return res.status(200).json({ status: true, message: "Success!!", withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
