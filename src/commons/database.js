const mongoose = require('mongoose');
const utility = require('./utility');

const statusCodes = utility.statusCodes;
const Exceptions = utility.Exceptions;

const options = {
  useCreateIndex: true,
  poolSize: 10,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferMaxEntries: 0,
};

const mongoUrl = 'mongodb://localhost:27017/book_db';
class Database {
  constructor() {
    try {
      const mongooseDb = mongoose.connect(
        mongoUrl,
        options,
      );
      if (mongooseDb) {
        this.connection = mongoose.connection;
      }
    } catch (error) {
      console.log(error);
      throw new Exceptions('Database Error', 'internalError', statusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = Database;
