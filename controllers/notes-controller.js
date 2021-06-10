//Models
const HttpError = require("../models/http-error");
const Note = require("../models/note");
const User = require("../models/user");

const createNote = async (req, res) => {
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
  }
const getAllNotes = (req, res) => {
    Note.find({}, (err, foundNotes) => {
      if (!err) {
        res.send(foundNotes);
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  }

  const deleteAllNotes = (req, res) => {
    Note.deleteMany({}, (err) => {
      if (!err) {
        res.send("Successfully deleted all notes.");
      } else {
        log(err);
        res.send("An error has occurred.");
      }
    });
  }

  const getAllUserNotes = (req, res) => {
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
  }

  const createUserNote = (req, res) => {
    const { userId } = req.params;
    const note = new Note({
      userId: userId,
      title: req.body.title,
      content: req.body.content,
    });

    User.find({ userId: userId }, async (err, foundUser) => {
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
  }

  const getNote = (req, res) => {
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
  }

  const putNote = (req, res) => {
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
  }

  const patchNote = (req, res) => {
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
  }

  const deleteNote = (req, res) => {
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
  }

  exports.getAllNotes = getAllNotes;
  exports.createNote = createNote;
  exports.deleteAllNotes = deleteAllNotes;
  exports.getAllUserNotes = getAllUserNotes;
  exports.createUserNote = createUserNote;
  exports.getNote = getNote;
  exports.putNote = putNote;
  exports.patchNote = patchNote;
  exports.deleteNote = deleteNote;