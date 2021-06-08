if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const log = console.log;
const PORT = process.env.PORT || 8080;

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
app.use(function (req, res, next) {
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

mongoose.connect("mongodb://localhost:27017/sipagDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  userId: String,
});

const notesSchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Note = new mongoose.model("Note", notesSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
//Dev Routes
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/notes.html");
  });
  app.get("/auth", (req, res) => {
    res.sendFile(__dirname + "/auth.html");
  });
}

//Register route
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  User.register(
    {
      username: username,
      userId: v4()
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
            log(err);
            res.status(500).json({
              status: 500,
              data: null,
              message: "Internal server error",
              error: err,
            });
          }
        });
      } else {
        log(err);
        res.status(400).json({
          status: 400,
          data: null,
          message: "User already exists",
          error: err,
        });
      }
    }
  );
});

//Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  User.findOne(
    {
      username: username,
    },
    (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          console.log(foundUser)
          const user = new User(foundUser);
          passport.authenticate("local")(req, res, async (err) => {
            if (!err) {
              await req.login(user, (err) => {
                if (!err) {
                  log(req.user)
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
                    message: "Incorrect Password",
                    error: err,
                  });
                }
              });
            } else {
              log(err);
              res.status(400).json({
                status: 400,
                data: null,
                message: "Bad Request",
                error: err,
              });
            }
          });
        } else {
          log(err);
          res.status(401).json({
            status: 401,
            data: null,
            message: "Incorrect Username",
            error: err,
          });
        }
      } else {
        log(err);
        res.status(500).json({
          status: 500,
          data: null,
          message: "Internal Server Error",
          error: err,
        });
      }
    }
  );
});

//Logout route
app.get("/logout", function (req, res) {
  req.logout();
  res.status(200).json({
    status: 200,
    data: userData,
    message: "Successfuly Logout",
  });
});

//Targeting all users
app
  .route("/users")
  .get((req, res) => {
    User.find({}, (err, foundUsers) => {
      if (!err) {
        res.send(foundUsers);
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  })
  .delete((req, res) => {
    User.deleteMany({}, (err) => {
      if (!err) {
        res.send("Successfully deleted all users");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  });

//Requests targeting a specific user
app
  .route("/users/:userId")
  .get((req, res) => {
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
  })
  .put((req, res) => {
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
  })
  .patch((req, res) => {
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
  })
  .delete((req, res) => {
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
  });

//Requests targeting all notes
app
  .route("/notes")
  .get((req, res) => {
    Note.find({}, (err, foundNotes) => {
      if (!err) {
        res.send(foundNotes);
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  })
  .post(async (req, res) => {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
    });

    await note.save((err) => {
      if (!err) {
        res.send("Successfully added a new note");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  })
  .delete((req, res) => {
    Note.deleteMany({}, (err) => {
      if (!err) {
        res.send("Successfully deleted all notes.");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  });

//Requests targeting all notes on a specific user
app
  .route("/:userId/notes")
  .get((req, res) => {
    const { userId } = req.params;
    Note.find({ userId: userId }, (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          res.send(foundUser);
        } else {
          res.send("No such notes");
        }
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  })
  .post((req, res) => {
    const { userId } = req.params;
    const note = new Note({
      userId: userId,
      title: req.body.title,
      content: req.body.content,
    });

    User.find({userId: userId}, async (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          await note.save((err) => {
            if (!err) {
              res.send("Successfully added a new note");
            } else {
              log(err);
              res.send("An error has occurred.");
            }
          });
        } else {
          res.send("No such user");
        }
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  });

//Requests targeting a specific note
app
  .route("/notes/:noteKey")
  .get((req, res) => {
    Note.findOne(
      {
        _id: req.params.noteKey,
      },
      (err, foundNotes) => {
        if (!err) {
          if (foundNotes) {
            res.send(foundNotes);
          } else {
            res.send("No such note");
          }
        } else {
          log(err);
          res.send("An error has occurred.");
        }
      }
    );
  })
  .put((req, res) => {
    Note.update(
      {
        _id: req.params.noteKey,
      },
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        overwrite: true,
      },
      (err) => {
        if (!err) {
          res.send("Note updated");
        } else {
          log(err);
          res.send("An error has occurred.");
        }
      }
    );
  })
  .patch((req, res) => {
    Note.update(
      {
        _id: req.params.noteKey,
      },
      {
        $set: req.body,
      },
      (err) => {
        if (!err) {
          res.send("Note updated");
        } else {
          log(err);
          res.send("An error has occurred.");
        }
      }
    );
  })
  .delete((req, res) => {
    Note.deleteOne(
      {
        _id: req.params.noteKey,
      },
      (err) => {
        if (!err) {
          res.send("Note deleted");
        } else {
          log(err);
          res.send("An error has occurred.");
        }
      }
    );
  });

app.listen(PORT, () => log("Server started on PORT ", PORT));
