const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const log = console.log;
const PORT = process.env.PORT || 8080;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-methods"
  );
  next();
});

mongoose.connect("mongodb://localhost:27017/notesDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const notesSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Note = new mongoose.model("Note", notesSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/form.html");
});

//Requests targeting all notes
app
  .route("/notes")
  .get((req, res) => {
    Note.find({}, (err, foundNotes) => {
      if (!err) {
        res.send(foundNotes);
      } else {
        res.send(err);
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
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    Note.deleteMany({}, (err) => {
      if (!err) {
        res.send("Successfully deleted all notes.");
      } else {
        res.send(err);
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
          res.send(err);
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
          res.send(err);
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
          res.send(err);
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
          res.send(err);
        }
      }
    );
  });

app.listen(PORT, () => log("Server started on PORT ", PORT));
