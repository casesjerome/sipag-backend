//Packages
const passport = require("passport");
const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const log = console.log;

//Models
const HttpError = require("../models/http-error");
const User = require("../models/user");

const register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      data: null,
      error: "Invalid Username and/or Password",
    });
  }
  const { username, password } = req.body;

  User.register(
    {
      username: username,
      userId: v4(),
    },
    password,
    (err, user) => {
      if (!err) {
        passport.authenticate("local")(req, res, (err) => {
          if (!err) {
            const userData = {
              userId: req.user.userId,
              username: req.user.username,
            };

            let token;
            try {
              token = jwt.sign(userData, process.env.JWT_SECRET_KEY, {
                expiresIn: "24h",
              }); 
            } catch (error) {
              log(err);
              return res.status(500).json({
                status: 500,
                data: null,
                error: "Signing up failed, please try again later",
              });
            }

            res.status(201).json({
              status: 201,
              data: userData,
              tkn: token,
              message: "Successfuly Registered",
            });
          } else {            
            log(err);
            res.status(500).json({
              status: 500,
              data: null,
              error: err,
            });
          }
        });
      } else {
        log(err);
        res.status(400).json({
          status: 400,
          data: null,
          error: err,
        });
      }
    }
  );
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      data: null,
      error: "Invalid Username and/or Password",
    });
  }
  const { username, password } = req.body;

  await User.findOne(
    {
      username: username,
    },
    (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          console.log(foundUser);
          const user = new User(foundUser);
          passport.authenticate("local")(req, res, async (err) => {
            if (!err) {
              await req.login(user, (err) => {
                if (!err) {
                  const userData = {
                    userId: req.user.userId,
                    username: req.user.username,
                  };

                  try {
                    token = jwt.sign(userData, process.env.JWT_SECRET_KEY, {
                      expiresIn: "24h",
                    }); 
                  } catch (error) {
                    log(err);
                    return res.status(500).json({
                      status: 500,
                      data: null,
                      error: "Logging in failed, please try again later",
                    });
                  }

                  res.status(200).json({
                    status: 200,
                    data: userData,
                    tkn: token,
                    message: "Successfuly Logged In",
                  });
                } else {
                  log(err);
                  res.status(401).json({
                    status: 401,
                    data: null,
                    error: err,
                  });
                }
              });
            } else {
              log(err);
              res.status(400).json({
                status: 400,
                data: null,
                error: err,
              });
            }
          });
        } else {
          log(err);
          res.status(401).json({
            status: 401,
            data: null,
            error: err,
          });
        }
      } else {
        log(err);
        res.status(500).json({
          status: 500,
          data: null,
          error: err,
        });
      }
    }
  );
};

const logout = async (req, res) => {
  try {
    await req.logout();
  } catch (error) {
    log(err);
    return res.status(500).json({
      status: 500,
      data: null,
      error: err,
    });
  }
  res.status(200).json({
    status: 200,
    data: userData,
    message: "Successfully Logout",
  });
};

const getAllUsers = async (req, res) => {
  await User.find({}, (err, foundUsers) => {
    if (!err) {
      res.send(foundUsers);
    } else {
      log(err);
      res.send("An error has occurred.");
    }
  });
};

const deleteAllUsers = async (req, res) => {
  await User.deleteMany({}, (err) => {
    if (!err) {
      res.send("Successfully deleted all users");
    } else {
      log(err);
      res.send("An error has occurred.");
    }
  });
};

const getSpecificUser = async (req, res) => {
  await User.findOne(
    {
      _id: req.params.userId,
    },
    (err, foundUsers) => {
      if (!err) {
        if (foundUsers) {
          res.send(foundUsers);
        } else {
          res.send("No such user");
        }
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    }
  );
};

const putSpecificUser = async (req, res) => {
  await User.update(
    {
      _id: req.params.userId,
    },
    {
      username: req.body.username,
      password: req.body.password,
    },
    {
      overwrite: true,
    },
    (err) => {
      if (!err) {
        res.send("User updated");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    }
  );
};

const patchSpecificUser = async (req, res) => {
  await User.update(
    {
      _id: req.params.userId,
    },
    {
      $set: req.body,
    },
    (err) => {
      if (!err) {
        res.send("User updated");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    }
  );
};

const deleteSpecificUser = async (req, res) => {
  await User.deleteOne(
    {
      _id: req.params.userId,
    },
    (err) => {
      if (!err) {
        res.send("User deleted");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    }
  );
};

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getAllUsers = getAllUsers;
exports.deleteAllUsers = deleteAllUsers;
exports.getSpecificUser = getSpecificUser;
exports.putSpecificUser = putSpecificUser;
exports.patchSpecificUser = patchSpecificUser;
exports.deleteSpecificUser = deleteSpecificUser;
