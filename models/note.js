//Packages
const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
  userId: String,
  noteId: String,
  title: String,
  content: String,
});

const Note = new mongoose.model("Note", notesSchema);

module.exports = Note;