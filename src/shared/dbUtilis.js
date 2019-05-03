import { save } from 'save-file';
import toBuffer from 'blob-to-buffer';
import { Book } from 'epubjs';
import fileUrl from 'file-url';

/**
 * extract cover from book and store on a given path
 * @param {Book}    book  from which, cover to be extract.
 * @param {String}  path  The path of the file to use as storage.
 * @param {Function} callback function
 */

function storeCover(book, path, cb) {
  book.loaded.cover.then(cover => {
    try {
      book.archive.getBlob(cover).then(blb => {
        toBuffer(blb, (err, buffer) => {
          if (err) throw err;
          save(buffer, path).then(() => {
            if (cb) {
              cb(path);
            }
          });
        });
      });
    } catch (err) {
      console.error(err);
    }
  });
}

/**
 * create key from path of file by removing slash, space and dot
 * @param {String}  path  The path from which key is genrated.
 * @returns {String} which will be used as a id to store file info in db
 */

function genrateKey(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  // eslint-disabled-next-line no-useless-escape
  return filePath.replace(/[\/\.]/g, '');
}

/**
 * genrate object with relavent information of book
 * @param {Book} book The book to extract info
 * @param {Function} callback The callback function
 */

function getInfo(filePath, callback) {
  // parameter validation
  if (!filePath || typeof filePath !== 'string') {
    return;
  }

  // create a key from path
  const key = genrateKey(filePath);

  // file load on file protocol
  const uri = fileUrl(filePath);
  const book = new Book(uri);

  book.ready.then(() => {
    const meta = book.package.metadata;
    const info = {
      id: key,
      title: meta.title,
      author: meta.creator,
      publisher: meta.publisher,
      path: uri,
      bookmarks: [],
    };
    if (callback) {
      callback(info, book);
    }
  });
}

export { storeCover, genrateKey, getInfo };
