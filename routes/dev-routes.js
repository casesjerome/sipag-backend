const express = require("express");
const bodyParser = require("body-parser");

const devRouter = express.Router();

devRouter.get("/", (req, res) => {
  res.sendFile(__dirname + "/notes.html");
});
devRouter.get("/auth", (req, res) => {
  res.sendFile(__dirname + "/auth.html");
});

module.exports = devRouter;