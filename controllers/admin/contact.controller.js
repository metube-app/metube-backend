const Contact = require("../../models/contact.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create contact
exports.store = async (req, res) => {
  try {
    if (!req.body.link || !req.body.name || !req.body.image)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const contact = new Contact();

    contact.image = req.body.image;
    contact.link = req.body.link;
    contact.name = req.body.name;
    await contact.save();

    return res.status(200).json({
      status: true,
      message: "Create Successfully",
      contact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update contact
exports.update = async (req, res) => {
  try {
    const contact = await Contact.findById(req.query.contactId);
    if (!contact) {
      return res.status(200).json({ status: false, message: "Contact does not found!!" });
    }

    if (req?.body?.image) {
      console.log("req?.body?.image: ", req?.body?.image);
      console.log("old contact image: ", contact.image);

      //delete the old image from digitalOcean Spaces
      const urlParts = contact.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      contact.image = req?.body?.image ? req?.body?.image : contact.image;
      console.log("updated contact image: ", contact.image);
    }

    contact.name = req?.body?.name ? req?.body?.name : contact.name;
    contact.link = req?.body?.link ? req?.body?.link : contact.link;
    await contact.save();

    return res.status(200).json({ status: true, message: "Update Successfully", contact });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete contact
exports.destroy = async (req, res) => {
  try {
    if (!req.query.contactId) {
      return res.status(200).json({ status: false, message: "Contact Id must be required!!" });
    }

    const contact = await Contact.findById(req.query.contactId);
    if (!contact) {
      return res.status(200).json({ status: false, message: "Contact does not found!!" });
    }

    await contact.deleteOne();

    //delete the old image from digitalOcean Spaces
    const urlParts = contact?.image?.split("/");
    const keyName = urlParts.pop(); //remove the last element
    const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

    await deleteFromSpace({ folderStructure, keyName });

    return res.status(200).json({ status: true, message: "delete Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get contact
exports.get = async (req, res) => {
  try {
    const contact = await Contact.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success", contact });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
