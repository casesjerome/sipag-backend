//Packages
const express = require("express");
const { check } = require("express-validator");

const usersRouter = express.Router();

//Controller
const usersController = require("../controllers/users-controller");

//Register route
usersRouter.post(
  "/register",
  [
    check("username").not().isEmpty(),
    check("username").isEmail(),
    check("password").isLength({ min: 6, max: 20 }),
  ],
  usersController.register
);

//Login route
usersRouter.post(
  "/login",
  [
    check("username").not().isEmpty(),
    check("username").isEmail(),    
  ],
  usersController.login
);

//Logout route
usersRouter.get("/logout", usersController.logout);

//Targeting all users
usersRouter
  .route("/all")
  .get(usersController.getAllUsers)
  .delete(usersController.deleteAllUsers);

//Requests targeting a specific user
usersRouter
  .route("/specific/:userId")
  .get(usersController.getSpecificUser)
  .put(usersController.putSpecificUser)
  .patch(usersController.patchSpecificUser)
  .delete(usersController.deleteSpecificUser);

module.exports = usersRouter;
