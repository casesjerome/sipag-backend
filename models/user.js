//Packages
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: {type: String, minlength: 6},
  userId: String,
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;
