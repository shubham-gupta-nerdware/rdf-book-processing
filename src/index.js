const express = require('express');

const app = express();
const fs = require('fs');
const util = require('util');
const chunk = require('lodash/chunk');
const path = require('path');
const Book = require('./model/book');
const xml2js = require('xml2js');

const readdir = util.promisify(fs.readdir);
const book = new Book();

const parser = new xml2js.Parser();
let allFiles = [];

const processBookData = (data, fileName) => {
  try {
    const d = data['rdf:RDF']['pgterms:ebook'][0];
    const id = d.$['rdf:about'].split('/')[1];
    const title = d['dcterms:title'][0];
    const publisher = d['dcterms:publisher'] ? d['dcterms:publisher'][0] : null;
    const publicationDate = d['dcterms:issued'] ? d['dcterms:issued'][0]._ : null;
    const license = d['dcterms:license'] ? d['dcterms:license'][0].$['rdf:resource'] : null;
    const language = d['dcterms:language'] && d['dcterms:language'][0]['rdf:Description'] ? d['dcterms:language'][0]['rdf:Description'][0]['rdf:value'][0]._ : null;
    const subject = d['dcterms:subject'] ? d['dcterms:subject'].map(sub => sub['rdf:Description'][0]['rdf:value'][0]) : [];
    const authors = d['dcterms:creator'] && d['dcterms:creator'][0]['pgterms:agent'] ? d['dcterms:creator'].map(auth => auth['pgterms:agent'][0]['pgterms:name'][0]) : [];

    return {
      id,
      title,
      publisher,
      publicationDate,
      subject,
      authors,
      license,
      language,
    };
  } catch (e) {
    console.log('Error While Processing', fileName, e);
  }
};

app.listen(5000, () => {
  console.log('info', 'Server for ebook capturing started on 5000');
});


async function saveRecord(message, fileName) {
  const data = await parser.parseStringPromise(message.data);
  const extractedData = processBookData(data, fileName);
  if (extractedData) {
    const isBookExists = await book.isBookExists({ id: extractedData.id });
    if (!isBookExists) {
      await book.create(extractedData);
    }
  }
}


const readFiles = params => new Promise((resolve) => {
  console.log('Params -->', params);
  const maxLength = 2000;
  const fls = chunk(allFiles, maxLength);
  const processedFiles = fls[0].map(async (f) => {
    const filePath = path.resolve(__dirname, `cache/epub/${f}/pg${f}.rdf`);
    const fdata = await fs.readFileSync(filePath);
    const fileData = fdata.toString();
    await saveRecord({ data: fileData }, f);
    return true;
  });

  Promise.all(processedFiles).then(async () => {
    allFiles.splice(0, maxLength);
    if (allFiles.length > 0) {
      await readFiles({ pending: allFiles.length });
    } else {
      console.log('All Files Done');
      resolve();
    }
  }).catch((e) => {
    console.log('readFiles Error', e);
  });
});


(async () => {
  const folder = path.resolve(__dirname, 'cache/epub');
  allFiles = await readdir(folder);
  const allFilesLength = allFiles.length;
  await readFiles({ processed: 0, totalFiles: allFilesLength });
})().catch((err) => {
  console.error(err);
});

