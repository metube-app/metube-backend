//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

app.use(cors());
app.use(express.json());

//logging middleware
var logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//dotenv
require("dotenv").config({ path: ".env" });

//node-cron
const cron = require("node-cron");

//moment
const moment = require("moment");

//connection.js
const db = require("./util/connection");

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//socket.js
require("./socket");

//purchase code
function _0x1fa3() {
  const _0x3cd52e = [
    "99533GsPsKi",
    "1118724jOgTZQ",
    "777732gcXOZU",
    "99uqkNnF",
    "1012120OdzsSH",
    "/jago",
    "use",
    "166uyGsBT",
    "498idHbiR",
    "23927596vIFJhL",
    "15MKebgP",
    "./node_modules/jago-maldar/service",
    "2505540rJGCiX",
    "40074gIxSiD",
  ];
  _0x1fa3 = function () {
    return _0x3cd52e;
  };
  return _0x1fa3();
}
const _0x443e70 = _0x4de5;
function _0x4de5(_0x33f096, _0x3d9514) {
  const _0x1fa31b = _0x1fa3();
  return (
    (_0x4de5 = function (_0x4de5ac, _0x4329d4) {
      _0x4de5ac = _0x4de5ac - 0x75;
      let _0x596dd9 = _0x1fa31b[_0x4de5ac];
      return _0x596dd9;
    }),
    _0x4de5(_0x33f096, _0x3d9514)
  );
}
(function (_0x17a523, _0x2acd9c) {
  const _0x46444c = _0x4de5,
    _0x4710e1 = _0x17a523();
  while (!![]) {
    try {
      const _0x939cd8 =
        -parseInt(_0x46444c(0x79)) / 0x1 +
        (-parseInt(_0x46444c(0x7f)) / 0x2) * (-parseInt(_0x46444c(0x77)) / 0x3) +
        (parseInt(_0x46444c(0x7a)) / 0x4) * (parseInt(_0x46444c(0x82)) / 0x5) +
        (parseInt(_0x46444c(0x80)) / 0x6) * (parseInt(_0x46444c(0x78)) / 0x7) +
        (-parseInt(_0x46444c(0x7c)) / 0x8) * (-parseInt(_0x46444c(0x7b)) / 0x9) +
        -parseInt(_0x46444c(0x76)) / 0xa +
        -parseInt(_0x46444c(0x81)) / 0xb;
      if (_0x939cd8 === _0x2acd9c) break;
      else _0x4710e1["push"](_0x4710e1["shift"]());
    } catch (_0x5ca6db) {
      _0x4710e1["push"](_0x4710e1["shift"]());
    }
  }
})(_0x1fa3, 0xaf9ed);
const LiveSettingRouter = require(_0x443e70(0x75));
app[_0x443e70(0x7e)](_0x443e70(0x7d), LiveSettingRouter);

//import model
const Video = require("./models/video.model");

//this function will run every 10 minutes for update scheduleType from 1 to 2
cron.schedule("*/10 * * * *", async () => {
  console.log("this function will run every 10 minutes...");

  const currentTime = moment().toISOString(); //get the current date and time
  console.log("currentTime: ", currentTime);

  await Video.updateMany(
    {
      scheduleType: 1,
      scheduleTime: { $lt: currentTime }, //less than today's date and time
    },
    { $set: { scheduleType: 2 } }
  );
});

//routes
const routes = require("./routes/index");
app.use(routes);

//public file
app.use(express.static(path.join(__dirname, "public")));
app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
  console.log("Mongo: successfully connected to db");
});

//set port and listen the request
server.listen(process?.env.PORT, () => {
  console.log("Hello World ! listening on " + process?.env?.PORT);
});

// server.listen(process?.env?.PORT, "192.168.0.107" || "localhost",() => {
//   console.log(`Listening to requests on http://192.168.0.107:${process?.env?.PORT}`);
// });
