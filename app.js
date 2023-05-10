let express = require("express");
let app = express();
let path = require("path");
let mongoose = require("mongoose");
require('dotenv').config()

let mongoDB = process.env.MONGU_URL;
mongoose.connect(mongoDB, {useNewUrlParser: true});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/main.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", require("./controllers"));
app.listen(process.env.PORT);
