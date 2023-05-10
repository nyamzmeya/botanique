var mongoose = require("mongoose");

var Schema = mongoose.Schema;

let UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  fav_devices: { type: [String], required: false },
});

let DeviceSchema = new Schema({
  title: { type: String, required: true },
  number: { type: String, required: true },
  subdivision: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, required: true, enum: ["Свободен", "Занят"] },
  work_status: {
    type: String,
    required: true,
    enum: ["В работе", "Отложен", "На проверке"],
  },
  work: [
    {
      time: { type: Date, required: true },
      type: { type: String, required: true, enum: ["Измерение", "Калибровка"] },
      description: { type: String, required: true },
      result: { type: String, required: false },
      user: { type: String, required: true },
    },
  ],
});

const Device = mongoose.model("Device", DeviceSchema);
const User = mongoose.model("User", UserSchema);
module.exports = { Device, User };
