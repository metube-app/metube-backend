const OTP = require("../../models/otp.model");

//nodemailer
const nodemailer = require("nodemailer");

//import model
const User = require("../../models/user.model");

//create OTP when user login
exports.otplogin = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(200).json({ status: false, message: "Email must be requried." });
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    const existOTP = await OTP.findOne({ email: req.body.email });

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();
      otp.email = req.body.email;
      otp.otp = newOtp;
      await otp.save();
    }

    var transporter = nodemailer.createTransport({
      service: "Gmail",
      user: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: `${process?.env?.EMAIL}`,
        pass: `${process?.env?.PASSWORD}`,
      },
    });

    //OTP MAIL
    var tab = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #333;
      }
      p {
        color: #666;
      }
      .otp {
        margin: 20px 0;
        padding: 10px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 17px
      }
      .support {
        color: #007bff;
        text-decoration: none;
      }
    </style>

    </head>
    <body>
      <div class="container">
        <p>Please use the following One-Time Password (OTP) to complete the verification process:</p>
        <div class="otp">
          <b>OTP: ${newOtp}</b>
          <p>(Note: This OTP is valid for a limited time, so make sure to use it promptly.)</p>
        </div>

        <p>If you encounter any issues during the verification process or have any questions, feel free to <a class="support" href="#">reach out to our support team</a>.</p>
      </div>
    </body>
    </html>`;

    //mail details
    var mailOptions = {
      from: `${process?.env?.EMAIL}`,
      to: req.body.email,
      subject: `Sending Email from ${process?.env?.appName}`,
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(200).json({ status: false, error: error.message || "Email Send Error" });
      } else {
        console.log(result);
        return res.status(200).json({ status: true, message: "Email Send Successfully to User" });
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

//create OTP and send the email for password security
exports.store = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(200).json({ status: false, message: "Email must be requried." });
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    const userEmail = await User.findOne({ email: req.body.email });
    if (!userEmail) {
      return res.status(200).json({ status: false, message: "User does not found with that email." });
    }

    const existOTP = await OTP.findOne({ email: req.body.email });

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();
      otp.email = req.body.email;
      otp.otp = newOtp;
      await otp.save();
    }

    var transporter = nodemailer.createTransport({
      service: "Gmail",
      user: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: `${process?.env?.EMAIL}`,
        pass: `${process?.env?.PASSWORD}`,
      },
    });

    //OTP MAIL
    var tab = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #333;
      }
      p {
        color: #666;
      }
      .otp {
        margin: 20px 0;
        padding: 10px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 17px
      }
      .support {
        color: #007bff;
        text-decoration: none;
      }
    </style>

    </head>
    <body>
      <div class="container">
        <b style="font-size: 20px">Hello </b><b style="color: green; font-size: 20px">${userEmail.fullName},</b>
        <br>

        <p>Please use the following One-Time Password (OTP) for Password Security:</p>
        <div class="otp">
          <b>OTP: ${newOtp}</b>
          <p>(Note: This OTP is valid for a limited time, so make sure to use it promptly.)</p>
        </div>

        <p>If you encounter any issues during the verification process or have any questions, feel free to <a class="support" href="#">reach out to our support team</a>.</p>
      </div>
    </body>
    </html>`;

    //mail details
    var mailOptions = {
      from: `${process?.env?.EMAIL}`,
      to: req.body.email,
      subject: `Sending Email from ${process?.env?.appName} for Password Security`,
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(200).json({ status: false, error: error.message || "Email send error" });
      } else {
        return res.status(200).json({ status: true, message: "Email Send Successfully for Password Security" });
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

//verify the OTP
exports.verify = async (req, res) => {
  try {
    if (!req.body.email || !req.body.otp) {
      return res.status(200).json({ status: false, message: "OTP and email must be requried!" });
    }

    const otpUser = await OTP.findOne({ email: req.body.email });
    if (!otpUser) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (parseInt(req.body.otp) === otpUser.otp) {
      otpUser.deleteOne();

      return res.status(200).json({ status: true, message: "OTP Verified Successfully!" });
    } else {
      return res.status(200).json({ status: false, message: "OTP does not match!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
