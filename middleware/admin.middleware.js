//JWT Token
const jwt = require("jsonwebtoken");

//import model
const Admin = require("../models/admin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");
    if (!Authorization) {
      return res.status(403).json({ status: false, message: "Oops!! You are not authorized!!" });
    }

    const decodeToken = await jwt.verify(Authorization, process?.env?.JWT_SECRET);

    const admin = await Admin.findById(decodeToken._id);
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
