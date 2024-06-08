//uploadObjectsToS3
const { uploadObjectsToS3 } = require("../../util/awsFunction");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//uploadContent
exports.uploadContent = async (req, res) => {
  try {
    //console.log("body: ", req.body);
    //console.log("file: ", req.file);

    if (!req.body?.folderStructure || !req.body?.keyName) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!req?.file) {
      return res.status(200).json({ status: false, message: "Please upload a valid files." });
    }

    await uploadObjectsToS3({
      folderStructure: req.body.folderStructure,
      keyName: req.body.keyName,
      filePath: req.file.path,
    });

    const url = `${process?.env?.endpoint}/${req.body.folderStructure}/${req.body.keyName}`;

    return res.status(200).json({ status: true, message: "finally, file uploaded Successfully.", url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete uploadContent
exports.deleteUploadContent = async (req, res) => {
  try {
    console.log("body: ", req.body);

    if (!req.body?.folderStructure || !req.body?.keyName) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    await deleteFromSpace({ folderStructure: req.body?.folderStructure, keyName: req.body?.keyName });

    return res.status(200).json({ status: true, message: "finally, file deleted Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
