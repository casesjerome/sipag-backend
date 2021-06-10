//Packages
const express = require("express");

const NotesRouter = express.Router();

//Controller
const notesController = require("../controllers/notes-controller");

//Requests targeting all notes
NotesRouter
  .route("/all")
  .get(notesController.getAllNotes)
  .post(notesController.createNote)
  .delete(notesController.deleteAllNotes);

//Requests targeting all notes on a specific user
NotesRouter
  .route("/all/:userId")
  .get(notesController.getAllUserNotes)
  .post(notesController.createUserNote);

//Requests targeting a specific note
NotesRouter
  .route("/specific/:noteId")
  .get(notesController.getNote)
  .put(notesController.putNote)
  .patch(notesController.patchNote)
  .delete(notesController.deleteNote);

module.exports = NotesRouter;
