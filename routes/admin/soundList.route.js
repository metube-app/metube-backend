//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const soundListController = require("../../controllers/admin/soundList.controller");

//create soundList by admin
route.post(
  "/createSoundList",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "soundImage", maxCount: 1 },
    { name: "soundLink", maxCount: 1 },
  ]),
  soundListController.createSoundList
);

//update soundList by admin
route.patch(
  "/updateSoundList",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "soundImage", maxCount: 1 },
    { name: "soundLink", maxCount: 1 },
  ]),
  soundListController.updateSoundList
);

//get all soundList
route.get("/getSoundList", checkAccessWithSecretKey(), soundListController.getSoundList);

//delete soundList by admin (multiple or single)
route.delete("/deleteSoundList", checkAccessWithSecretKey(), soundListController.deleteSoundList);

module.exports = route;
