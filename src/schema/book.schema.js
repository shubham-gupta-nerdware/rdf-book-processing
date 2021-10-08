const mongoose = require('mongoose');

const Book = new mongoose.Schema(
  {
    id: {
      type: String,
      index: true,
      required: true,
    },

    title: {
      type: String,
      required: true,
      index: true,
    },

    publisher: {
      type: String,
      required: true,
    },

    publicationDate: {
      type: Date,
      required: true,
    },

    subject: {
      type: Array,
    },
    authors: {
      type: Array,
    },
    license: {
      type: String,
    },
    language: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = Book;
