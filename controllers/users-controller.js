//Packages
const passport = require("passport");
const { validationResult } = require("express-validator");
const { v4 } = require("uuid");

//Models
const HttpError = require("../models/http-error");
const User = require("../models/user");

const log = console.log;

const register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      data: null,
      error: errors,
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
            res.status(201).json({
              status: 201,
              data: userData,
              message: "Successfuly Registered",
            });
          } else {
            // throw new HttpError("Internal server error", 500, err);
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

const login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      data: null,
      error: errors,
    });
  }
  const { username, password } = req.body;

  User.findOne(
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
                  res.status(200).json({
                    status: 200,
                    data: userData,
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

const logout = (req, res) => {
  try {
    req.logout();
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

const getAllUsers = (req, res) => {
  User.find({}, (err, foundUsers) => {
    if (!err) {
      res.send(foundUsers);
    } else {
      log(err);
      res.send("An error has occurred.");
    }
  });
};

const deleteAllUsers = (req, res) => {
  User.deleteMany({}, (err) => {
    if (!err) {
      res.send("Successfully deleted all users");
    } else {
      log(err);
      res.send("An error has occurred.");
    }
  });
};

const getSpecificUser = (req, res) => {
  User.findOne(
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

const putSpecificUser = (req, res) => {
  User.update(
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

const patchSpecificUser = (req, res) => {
  User.update(
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

const deleteSpecificUser = (req, res) => {
  User.deleteOne(
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
