let { User } = require("./models");
let express = require("express");
let { Device } = require("./models");

const getUser = async (req, res) => {
  try {
    let user = await User.findOne({});
    let devices = await Device.find({ title: { $in: user.fav_devices } });
    res.status(200).json({ user: user, devices: devices });
  } catch (error) {
    res.send(error);
  }
};

const addUser = async (req, res) => {
  try {
    let user = await User.create(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.send(error);
  }
};

const addDevice = async (req, res) => {
  try {
    let device = await Device.create(req.body);
    res.status(200).json(device);
  } catch (error) {
    res.send(error);
  }
};

const changeDeviceStatus = async (req, res) => {
  try {
    let updated = await Device.findByIdAndUpdate(
      req.body.id,
      {
        status: req.body.status,
      },
      { new: true, unValidators: true }
    );
    res.send(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



const router = express.Router();

router.route("/user").get(getUser);
router.route("/add_user").post(addUser);
router.route("/add_device").post(addDevice);
router.route("/status").patch(changeDeviceStatus);

module.exports = router;
