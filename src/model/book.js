const utility = require('../commons/utility');
const Database = require('../commons/database');
const Book = require('../schema/book.schema');
const Joi = require('@hapi/joi');

const statusCodes = utility.statusCodes;
const Exceptions = utility.Exceptions;

const validationSchemas = {
  createBookSchema: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    title: Joi.string().required(),
    publisher: Joi.string().required(),
    publicationDate: Joi.date().required(),
    subject: Joi.array(),
    authors: Joi.array(),
    language: Joi.string().required(),
  }).options({ abortEarly: false }),
};


class Books extends Database {
  constructor(connection) {
    super('book', connection);
    this.name = 'book';
    this.schema = Book;
    this.model = this.connection.model(this.name, this.schema);
  }

  /**
   * Query for inserting new Bool Document
   * @param params Object
  */
  async create(request) {
    try {
      const book = await this.model.create(request);
      return book;
    } catch (e) {
      throw new Exceptions(e.message, 'internalError', statusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async isBookExists(query) {
    const bookDetails = await this.model.findOne(query).lean();
    if (bookDetails) {
      return true;
    }
    return false;
  }

  /**
   * Validate request body data based on schema defined
  */
  static async validateRequest(body, schema) {
    try {
      await validationSchemas[schema].validateAsync(body);
    } catch (error) {
      const errorMessage = [];
      error.details.forEach((msg) => {
        errorMessage.push(msg.message);
      });
      throw new Exceptions(errorMessage.toString(), 'BadRequest', statusCodes.BAD_REQUEST);
    }
  }
}

module.exports = Books;
