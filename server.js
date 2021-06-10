if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const app = express();
const log = console.log;
const PORT = process.env.PORT || 8080;

//Routes
const notesRouter = require("./routes/notes-routes");
const usersRouter = require("./routes/users-routes");
const HttpError = require("./models/http-error");

//Middleware
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-methods"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

//Routes
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);
if (process.env.NODE_ENV !== "production") {
  const devRouter = require("./routes/dev-routes");
  app.use(devRouter);
}
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

//Database
mongoose.connect("mongodb://localhost:27017/sipagDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.listen(PORT, () => log("Server started on PORT ", PORT));
