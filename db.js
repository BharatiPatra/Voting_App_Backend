const mongoose = require("mongoose");
const mongoURL = "mongodb://localhost:27017/voting";
mongoose.connect(mongoURL);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("Mongo db connected");
});
db.on("error", () => {
  console.log("Mongo db error");
});
db.on("disconnected", () => {
  console.log("Mongo db disconnected");
});
module.exports = db;
