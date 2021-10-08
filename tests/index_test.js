/* eslint-disable no-undef */
const mongoose = require('mongoose');


const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const expect = chai.expect;
chai.use(chaiAsPromised);

const path = require('path');
const util = require('util');
const fs = require('fs');

const readdir = util.promisify(fs.readdir);
const rewire = require('rewire');

const index = rewire('../src/index');
const Book = require('../src/model/book');

const options = {
  useCreateIndex: true,
  poolSize: 10,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferMaxEntries: 0,
};

const bookRequest = {
  id: 'shubhamGupta',
  title: 'test book',
  publisher: 'shubham publications',
  publicationDate: '2003-11-01',
  subject: ['Southern States -- Social life and customs -- Fiction'],
  authors: [
    'Cabell, James Branch'],
  license: 'license',
  language: 'en',
};


describe('ebook management', () => {
  before((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost:27017/book_db', options);
    mongoose.connection
      .once('open', () => console.log('Connected!'))
      .on('error', (error) => {
        console.warn('Error : ', error);
      });
    mongoose.connection.db.collection('books', (err, collection) => {
      collection.deleteMany({ id: 'test' }).then(() => {
        done();
      });
    });
  });

  const book = new Book();


  it('creates a book', async () => {
    const bookData = await book.create(bookRequest);
    expect(bookData.id).to.eq(bookRequest.id);
    expect(bookData.title).to.eq(bookRequest.title);
  });

  it('check if book exists ', async () => {
    const bookData = await book.create(bookRequest);
    expect(bookData.id).to.eq(bookRequest.id);
    expect(bookData.title).to.eq(bookRequest.title);
    const isBookExists = await book.isBookExists({ id: bookData.id });
    expect(isBookExists).to.eq(true);
  });

  it('validate Request should throw error', async () => {    
    await expect(Book.validateRequest(bookRequest, 'createBookSchema')).to.be.rejected;
  });


  it('read files', async () => {
    const folder = path.resolve(__dirname, 'cache/epub');
    const testFiles = await readdir(folder);
    index.__set__('allFiles', testFiles);
    const readFile = index.__get__('readFiles');
    const readFiles = sinon.spy(readFile);

    await readFiles({ processed: 0, totalFiles: 1 });
    expect(readFiles.called).to.eq(true);
    expect(readFiles.withArgs({ processed: 0, totalFiles: 1 }).calledOnce).to.eq(true);
  });

  after((done) => {
    mongoose.connection.db.collection('books', (err, collection) => {
      collection.deleteOne({ id: 'test' }).then(() => {
        done();
      });
    });
  });
});
