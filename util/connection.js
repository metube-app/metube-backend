//mongoose
const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://metubeapp1:wDf2ol6IYQBeFy4I@cluster0.briwpaq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useFindAndModify: false,
  //useCreateIndex: true,
});

//mongoose connection
const db = mongoose.connection;

module.exports = db;
