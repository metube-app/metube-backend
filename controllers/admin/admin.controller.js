const Admin = require("../../models/admin.model");

//jwt token
const jwt = require("jsonwebtoken");

//bcrypt
const bcrypt = require("bcryptjs");

//nodemailer
const nodemailer = require("nodemailer");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//jago-maldar
const LiveUser = require("jago-maldar");

//import model
const Login = require("../../models/login.model");

//create admin
exports.store = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.code) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    function _0x57e8(_0x5ae94d, _0x5b865c) {
      const _0x300e84 = _0x300e();
      return (
        (_0x57e8 = function (_0x57e8c5, _0x20bd92) {
          _0x57e8c5 = _0x57e8c5 - 0x1cd;
          let _0xb0be85 = _0x300e84[_0x57e8c5];
          return _0xb0be85;
        }),
        _0x57e8(_0x5ae94d, _0x5b865c)
      );
    }
    const _0x438c04 = _0x57e8;
    function _0x300e() {
      const _0x38f98e = [
        "14012380UWYXfP",
        "1373638ikEAGI",
        "body",
        "7667086DVcHWp",
        "1624434yHRQGp",
        "117831XtOHRQ",
        "code",
        "211272jfEcYe",
        "5PteiEV",
        "25006454pKBbSf",
        "279AtHtxZ",
        "2Eneakg",
        "136Ttpxjy",
      ];
      _0x300e = function () {
        return _0x38f98e;
      };
      return _0x300e();
    }
    (function (_0x273de4, _0x2b61aa) {
      const _0x4f19c6 = _0x57e8,
        _0x4377f7 = _0x273de4();
      while (!![]) {
        try {
          const _0x1c34ab =
            (-parseInt(_0x4f19c6(0x1d0)) / 0x1) * (parseInt(_0x4f19c6(0x1d3)) / 0x2) +
            (-parseInt(_0x4f19c6(0x1d7)) / 0x3) * (-parseInt(_0x4f19c6(0x1d1)) / 0x4) +
            (-parseInt(_0x4f19c6(0x1cd)) / 0x5) * (parseInt(_0x4f19c6(0x1d6)) / 0x6) +
            parseInt(_0x4f19c6(0x1d5)) / 0x7 +
            (-parseInt(_0x4f19c6(0x1d9)) / 0x8) * (-parseInt(_0x4f19c6(0x1cf)) / 0x9) +
            parseInt(_0x4f19c6(0x1d2)) / 0xa +
            -parseInt(_0x4f19c6(0x1ce)) / 0xb;
          if (_0x1c34ab === _0x2b61aa) break;
          else _0x4377f7["push"](_0x4377f7["shift"]());
        } catch (_0x13810d) {
          _0x4377f7["push"](_0x4377f7["shift"]());
        }
      }
    })(_0x300e, 0xb2f0e);

    const data = await LiveUser(req[_0x438c04(0x1d4)][_0x438c04(0x1d8)], 0x312c8bf);

    if (data) {
      const admin = new Admin();

      admin.email = req.body.email;
      admin.password = cryptr.encrypt(req.body.password);
      admin.purchaseCode = req.body.code;
      admin.name = req.body.name ? req.body.name : "Admin";
      admin.image = req.body.image ? req.body.image : "";
      await admin.save();

      const login = await Login.findOne();

      if (!login) {
        const newLogin = new Login();
        newLogin.login = true;
        await newLogin.save();
      } else {
        login.login = true;
        await login.save();
      }

      return res.status(200).json({
        status: true,
        message: "finally, admin created Successfully!",
        admin,
      });
    } else {
      return res.status(200).json({ status: false, message: "Purchase code is not valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//admin login
exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "Oops ! admin does not found with that email.",
      });
    }

    if (cryptr.decrypt(admin.password) !== req.body.password) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Password doesn't matched!",
      });
    }

    function _0x57e8(_0x5ae94d, _0x5b865c) {
      const _0x300e84 = _0x300e();
      return (
        (_0x57e8 = function (_0x57e8c5, _0x20bd92) {
          _0x57e8c5 = _0x57e8c5 - 0x1cd;
          let _0xb0be85 = _0x300e84[_0x57e8c5];
          return _0xb0be85;
        }),
        _0x57e8(_0x5ae94d, _0x5b865c)
      );
    }
    const _0x438c04 = _0x57e8;
    function _0x300e() {
      const _0x38f98e = [
        "14012380UWYXfP",
        "1373638ikEAGI",
        "body",
        "7667086DVcHWp",
        "1624434yHRQGp",
        "117831XtOHRQ",
        "code",
        "211272jfEcYe",
        "5PteiEV",
        "25006454pKBbSf",
        "279AtHtxZ",
        "2Eneakg",
        "136Ttpxjy",
      ];
      _0x300e = function () {
        return _0x38f98e;
      };
      return _0x300e();
    }
    (function (_0x273de4, _0x2b61aa) {
      const _0x4f19c6 = _0x57e8,
        _0x4377f7 = _0x273de4();
      while (!![]) {
        try {
          const _0x1c34ab =
            (-parseInt(_0x4f19c6(0x1d0)) / 0x1) * (parseInt(_0x4f19c6(0x1d3)) / 0x2) +
            (-parseInt(_0x4f19c6(0x1d7)) / 0x3) * (-parseInt(_0x4f19c6(0x1d1)) / 0x4) +
            (-parseInt(_0x4f19c6(0x1cd)) / 0x5) * (parseInt(_0x4f19c6(0x1d6)) / 0x6) +
            parseInt(_0x4f19c6(0x1d5)) / 0x7 +
            (-parseInt(_0x4f19c6(0x1d9)) / 0x8) * (-parseInt(_0x4f19c6(0x1cf)) / 0x9) +
            parseInt(_0x4f19c6(0x1d2)) / 0xa +
            -parseInt(_0x4f19c6(0x1ce)) / 0xb;
          if (_0x1c34ab === _0x2b61aa) break;
          else _0x4377f7["push"](_0x4377f7["shift"]());
        } catch (_0x13810d) {
          _0x4377f7["push"](_0x4377f7["shift"]());
        }
      }
    })(_0x300e, 0xb2f0e);

    const data = await LiveUser(req[_0x438c04(0x1d4)][_0x438c04(0x1d8)], 0x312c8bf);

    if (data) {
      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
      };

      const token = jwt.sign(payload, process?.env?.JWT_SECRET);

      return res.status(200).json({
        status: true,
        message: "finally, admin login Successfully!",
        token,
      });
    } else {
      return res.status(200).json({ status: false, message: "Purchase code is not valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//update purchase code
exports.updateCode = async (req, res) => {
  try {
    if (!req.body.code || !req.body.email || !req.body.password) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "Oops ! admin does not found with that email.",
      });
    }

    if (cryptr.decrypt(admin.password) !== req.body.password) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Password doesn't matched!",
      });
    }

    function _0x57e8(_0x5ae94d, _0x5b865c) {
      const _0x300e84 = _0x300e();
      return (
        (_0x57e8 = function (_0x57e8c5, _0x20bd92) {
          _0x57e8c5 = _0x57e8c5 - 0x1cd;
          let _0xb0be85 = _0x300e84[_0x57e8c5];
          return _0xb0be85;
        }),
        _0x57e8(_0x5ae94d, _0x5b865c)
      );
    }
    const _0x438c04 = _0x57e8;
    function _0x300e() {
      const _0x38f98e = [
        "14012380UWYXfP",
        "1373638ikEAGI",
        "body",
        "7667086DVcHWp",
        "1624434yHRQGp",
        "117831XtOHRQ",
        "code",
        "211272jfEcYe",
        "5PteiEV",
        "25006454pKBbSf",
        "279AtHtxZ",
        "2Eneakg",
        "136Ttpxjy",
      ];
      _0x300e = function () {
        return _0x38f98e;
      };
      return _0x300e();
    }
    (function (_0x273de4, _0x2b61aa) {
      const _0x4f19c6 = _0x57e8,
        _0x4377f7 = _0x273de4();
      while (!![]) {
        try {
          const _0x1c34ab =
            (-parseInt(_0x4f19c6(0x1d0)) / 0x1) * (parseInt(_0x4f19c6(0x1d3)) / 0x2) +
            (-parseInt(_0x4f19c6(0x1d7)) / 0x3) * (-parseInt(_0x4f19c6(0x1d1)) / 0x4) +
            (-parseInt(_0x4f19c6(0x1cd)) / 0x5) * (parseInt(_0x4f19c6(0x1d6)) / 0x6) +
            parseInt(_0x4f19c6(0x1d5)) / 0x7 +
            (-parseInt(_0x4f19c6(0x1d9)) / 0x8) * (-parseInt(_0x4f19c6(0x1cf)) / 0x9) +
            parseInt(_0x4f19c6(0x1d2)) / 0xa +
            -parseInt(_0x4f19c6(0x1ce)) / 0xb;
          if (_0x1c34ab === _0x2b61aa) break;
          else _0x4377f7["push"](_0x4377f7["shift"]());
        } catch (_0x13810d) {
          _0x4377f7["push"](_0x4377f7["shift"]());
        }
      }
    })(_0x300e, 0xb2f0e);

    const data = await LiveUser(req[_0x438c04(0x1d4)][_0x438c04(0x1d8)], 0x312c8bf);

    if (data) {
      admin.purchaseCode = req.body.code;
      await admin.save();

      return res.status(200).json({
        status: true,
        message: "Purchase Code Updated Successfully.",
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Purchase Code is not valid.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({ status: true, message: "finally, admin profile get by admin!", user: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found." });
    }

    if (req?.body?.image) {
      console.log("req?.body? in update admin: ", req.body);
      console.log("old image: ", admin.image);

      //delete the old image from digitalOcean Spaces
      const urlParts = admin?.image.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3)?.join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });
      admin.image = req?.body?.image ? req?.body?.image : admin.image;
    }

    admin.name = req?.body?.name ? req?.body?.name : admin.name;
    admin.email = req?.body?.email ? req?.body?.email : admin.email;

    await admin.save();

    console.log("new image: ", admin.image);

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "finally, admin profile updated Successfully!",
      admin: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//send email for forgot the password (forgot password)
exports.forgotPassword = async (req, res) => {
  try {
    if (!req.body.email)
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details!",
      });

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found with that email." });
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process?.env?.EMAIL,
        pass: process?.env?.PASSWORD,
      },
    });

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab +=
      "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab += " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab += "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab += "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab += "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab += "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab +=
      "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab +=
      "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab +=
      "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      process?.env?.baseURL +
      "changePassword/" +
      admin._id +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab += "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    var mailOptions = {
      from: process?.env?.EMAIL,
      to: req.body.email,
      subject: `Sending email from ${process?.env?.appName} for Password Security`,
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({
          status: true,
          message: "finally, email send for forget the password!",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    admin.password = hash;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully!",
      admin: admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    if (!req.body.newPassword || !req.body.confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (req.body.newPassword === req.body.confirmPassword) {
      admin.password = bcrypt.hashSync(req.body.newPassword, 10);

      await admin.save();

      return res.status(200).json({
        status: true,
        message: "password has been changed Successfully.",
        admin,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
