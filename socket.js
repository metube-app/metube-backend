//import model
const User = require("./models/user.model");
const LiveUser = require("./models/liveUser.model");
const LiveHistory = require("./models/liveHistory.model");
const LiveView = require("./models/liveView.model");

//moment
const moment = require("moment");

//mongoose
const mongoose = require("mongoose");

io.on("connect", async (socket) => {
  console.log("Socket Connection done: ", socket.id);

  const { liveRoom } = socket.handshake.query;
  console.log("liveRoom", liveRoom);
  console.log("socket.handshake.query", socket.handshake.query);

  const id = liveRoom && liveRoom.split(":")[1];
  console.log("id: ", id);

  socket.join(liveRoom);

  //connect user in liveRoom
  socket.on("liveRoomConnect", async (data) => {
    console.log("liveRoomConnect  connected:   ");

    const parsedData = JSON.parse(data);
    console.log("liveRoomConnect connected (parsed):   ", parsedData);

    const sockets = await io.in(liveRoom).fetchSockets();
    //console.log("sockets: ", sockets);

    sockets?.length ? sockets[0].join("liveUserRoom:" + parsedData.liveHistoryId) : console.log("sockets not able to emit");

    io.in("liveUserRoom:" + parsedData.liveHistoryId).emit("liveRoomConnect", data);
  }); //to join the first socket (sockets[0]) to a new room named "liveUserRoom:" + liveHistoryId

  socket.on("addView", async (data) => {
    console.log("data in addView:  ", data);

    const dataOfaddView = JSON.parse(data);
    console.log("parsed data in addView:  ", dataOfaddView);

    const sockets = await io.in(liveRoom).fetchSockets();
    //console.log("sockets in addView viewUserRoom:  ", sockets);

    sockets?.length ? sockets[0].join("liveUserRoom:" + dataOfaddView.liveHistoryId) : console.log("sockets not able to emit");

    const user = await User.findById(dataOfaddView.userId);
    const liveUser = await LiveUser.findOne({ liveHistoryId: dataOfaddView.liveHistoryId });

    if (user && liveUser) {
      const existLiveView = await LiveView.findOne({
        userId: dataOfaddView.userId,
        liveHistoryId: dataOfaddView.liveHistoryId,
      });
      console.log("existLiveView in user and liveUser (addView):  ", existLiveView);

      if (!existLiveView) {
        console.log("new liveView in user and liveUser (addView): ");

        const liveView = new LiveView();

        liveView.userId = dataOfaddView.userId;
        liveView.liveHistoryId = dataOfaddView.liveHistoryId;
        liveView.fullName = user.fullName;
        liveView.nickName = user.nickName;
        liveView.image = user.image;

        await liveView.save();
      }
    }

    const liveView = await LiveView.find({ liveHistoryId: dataOfaddView.liveHistoryId });
    console.log("liveView in addView: ", liveView.length);

    if (liveUser) {
      liveUser.view = liveView.length;
      await liveUser.save();
    }

    if (liveView.length === 0) {
      return io.in("liveUserRoom:" + dataOfaddView.liveHistoryId).emit("addView", liveView.length);
    }

    io.in("liveUserRoom:" + dataOfaddView.liveHistoryId).emit("addView", liveView.length);
  });

  socket.on("lessView", async (data) => {
    console.log("data in lessView:  ", data);

    const dataOflessView = JSON.parse(data);
    console.log("parsed data in lessView:  ", dataOflessView);

    const sockets = await io.in(liveRoom).fetchSockets();
    //console.log("sockets in lessView liveRoom:  ", sockets);

    sockets?.length
      ? sockets[0].leave("liveUserRoom:" + dataOflessView.liveHistoryId)
      : console.log("sockets not able to leave in lessView");

    const existLiveView = await LiveView.findOne({
      userId: dataOflessView.userId,
      liveHistoryId: dataOflessView.liveHistoryId,
    });

    if (existLiveView) {
      console.log("existLiveView deleted in lessView for that liveHistoryId");
      await existLiveView.deleteOne();
    }

    const liveView = await LiveView.find({ liveHistoryId: dataOflessView.liveHistoryId });
    console.log("liveView in lessView:  ", liveView.length);

    const liveUser = await LiveUser.findOne({ liveHistoryId: dataOflessView.liveHistoryId });
    if (liveUser) {
      liveUser.view = liveView.length;
      await liveUser.save();
    }

    if (liveView.length === 0) {
      return io.in("liveUserRoom:" + dataOflessView.liveHistoryId).emit("lessView", liveView.length);
    }

    io.in("liveUserRoom:" + dataOflessView?.liveHistoryId).emit("lessView", liveView.length);
  });

  socket.on("liveChat", async (data) => {
    console.log("data in comment: ", data);

    const dataOfComment = JSON.parse(data);
    console.log("parsed data in comment: ", dataOfComment);
    //console.log("data.liveHistoryId in comment: ", dataOfComment.liveHistoryId);

    const sockets = await io.in(liveRoom).fetchSockets();
    //console.log("sockets in comment:  ", sockets);

    sockets?.length ? sockets[0].join("liveUserRoom:" + dataOfComment.liveHistoryId) : console.log("sockets not able to emit");

    const liveHistory = await LiveHistory.findById(dataOfComment.liveHistoryId);
    if (liveHistory) {
      liveHistory.totalLiveChat += 1;
      await liveHistory.save();
    }

    io.in("liveUserRoom:" + dataOfComment?.liveHistoryId).emit("liveChat", data);
  });

  socket.on("endLiveUser", async (data) => {
    console.log("data in endLiveUser: ", data);

    const parsedData = JSON.parse(data);
    console.log("parsedData in endLiveUser: ", parsedData);

    try {
      const [user, liveHistory] = await Promise.all([
        User.findOne({ liveHistoryId: parsedData?.liveHistoryId }),
        LiveHistory.findById(parsedData?.liveHistoryId),
      ]);

      if (user) {
        if (user.isLive) {
          liveHistory.endTime = moment().format("HH:mm:ss");

          var date1 = moment(liveHistory.startTime, "HH:mm:ss");
          var date2 = moment(liveHistory.endTime, "HH:mm:ss");

          var timeDifference = date2.diff(date1);
          var duration = moment.duration(timeDifference);
          var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

          liveHistory.duration = durationTime;

          const [updateLiveHistory, userUpdate] = await Promise.all([
            liveHistory.save(),
            User.findOneAndUpdate({ _id: user._id }, { $set: { isLive: false, liveHistoryId: null } }, { new: true }),
            LiveUser.deleteOne({ userId: user._id }),
            LiveView.deleteMany({ liveHistoryId: liveHistory._id }),
          ]);

          console.log("userUpdate in endLiveUser: ", userUpdate);
          console.log("liveUser and related liveView deleted in endLiveUser");
        }

        io.in("liveUserRoom:" + parsedData?.liveHistoryId).emit("endLiveUser", parsedData);

        const sockets = await io.in("liveUserRoom:" + parsedData?.liveHistoryId).fetchSockets();
        console.log("sockets.length: ", sockets.length);

        sockets?.length ? io.socketsLeave(parsedData?.liveHistoryId) : console.log("sockets not able to leave in endLiveUser");
      }
    } catch (error) {
      console.error("Error in endLiveUser:", error);
    }
  });

  socket.on("disconnect", async (reason) => {
    console.log(`socket disconnect ===============`, id, socket?.id, reason);

    if (liveRoom) {
      const socket = await io.in(liveRoom).fetchSockets();

      if (socket?.length == 0) {
        const userId = new mongoose.Types.ObjectId(id);
        const user = await User.findById(userId);
        if (user) {
          if (user.isLive) {
            const liveHistory = await LiveHistory.findById(user.liveHistoryId);
            console.log("liveHistory in disconnect liveRoom: ", liveHistory);

            liveHistory.endTime = moment().format("HH:mm:ss");

            var date1 = moment(liveHistory.startTime, "HH:mm:ss");
            var date2 = moment(liveHistory.endTime, "HH:mm:ss");
            var timeDifference = date2.diff(date1);
            var duration = moment.duration(timeDifference);
            var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

            liveHistory.duration = durationTime;

            const [updateLiveHistory, userUpdate] = await Promise.all([
              liveHistory.save(),
              User.findOneAndUpdate({ _id: user._id }, { $set: { isLive: false, liveHistoryId: null } }, { new: true }),
              LiveUser.deleteOne({ userId: user._id }),
              LiveView.deleteMany({ liveHistoryId: liveHistory._id }),
            ]);

            console.log("userUpdate in endLiveUser: ", userUpdate);

            console.log("liveUser and related liveView deleted in endLiveUser");
          }

          const sockets = await io.in("liveUserRoom:" + user?.liveHistoryId?.toString()).fetchSockets();
          console.log("sockets.length: ", sockets.length);

          sockets?.length
            ? io.socketsLeave("liveUserRoom:" + user?.liveHistoryId?.toString())
            : console.log("sockets not able to leave in disconnect");
        }
      }
    }
  });
});
