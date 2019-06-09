// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
import { save } from 'save-file';
import toBuffer from 'blob-to-buffer';
import { Book } from 'epubjs';
import fileUrl from 'file-url';
import path from 'path';
import * as Vibrant from 'node-vibrant';

/**
 * extract cover from book and store on a given path
 * @param {Book}    book  from which, cover to be extract.
 * @param {String}  path  The path of the file to use as storage.
 * @param {Function} callback function
 */

function storeCover(book, path, cb) {
  book.loaded.cover.then(cover => {
    if (!cover) {
      cb(false);
      return;
    }
    try {
      book.archive.getBlob(cover).then(blb => {
        toBuffer(blb, (err, buffer) => {
          if (err) throw err;
          save(buffer, path).then(() => {
            if (cb) {
              cb(true);
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
  return filePath.replace(/[ \/\.]/g, '');
}

/**
 * parsh the toc provided by epubjs to required form by element-ui tree component
 * also get cfi of toc item from spine
 * @param {Object} Book - EPUBJS Book needed to be ready 
 * @returns {Array} returns array of toc tree that easily adopted by el-tree
 */
function parshToc(book) {
  
  const { toc } = book.navigation;
  const { spine } = book;
  
  /**
   * some epubs not uese standerd href or epubjs fails to process them
   * @param {String} href  The href to validate
   * @returns {String} href
   */
  const validateHref = href => {
    if (href.startsWith('..')) {
      href = href.substring(2);
    }
    if (href.startsWith('/')) {
      href = href.substring(1);
    }
    return href;
  };

  /**
   * Return spin part from href
   * 
   * TL;DR
   * Toc item points exact postion of chapter or subChapter by using hase ID
   * in href. In more genrale href looks like ch001#title.
   * The ch001 is spine item and title is element id for which tocitem is.
   * We can get cfi of toc from this two item.
   * 
   * @param {String} href - The herf to get spine component 
   * @returns {String} - The Spine item href
   */
  const getSpineComponent = href => { 
    return href.split('#')[0];
  }

  /**
   * Returns elementId part of href 
   * @param {String} href 
   */
  const getPositonComponent = href => { 
    return href.split('#')[1];
  }

  const tocTree = [];

  /**
   * recursively go through toc and parsh it
   * @param {toc} toc
   * @param {parrent} parrent
   */
  const createTree = (toc, parrent) => {
    for (let i = 0; i < toc.length; i += 1) {

      // get clean href
      const href = validateHref(toc[i].href);
      
      // get spin and elementId part from href
      const spineComponent = getSpineComponent(href);   
      const positonComponent = getPositonComponent(href);

      // get spinItem from href
      const spineItem = spine.get(spineComponent);
      
      // load spin item
      spineItem.load(book.load.bind(book)).then(() => {

        // get element by positionComponent which is basically elementId
        const el = spineItem.document.getElementById(positonComponent);
        // get cfi from element
        const cfi = spineItem.cfiFromElement(el);
        // get percent from cfi
        const percentage = book.locations.percentageFromCfi(cfi);
        
        // toc item which has
        parrent[i] = {
          label: toc[i].label.trim(),
          children: [],
          href,
          cfi,
          percentage,
        };

        // if toc has subitems recursively parsh it
        if (toc[i].subitems) {
          createTree(toc[i].subitems, parrent[i].children);
        }

      });
    }
  };

  createTree(toc, tocTree);
  return tocTree;
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

  book.ready
    .then(() => {
      return book.locations.generate();
    })
    .then(locations => {
      const meta = book.package.metadata;

      const info = {
        id: key,
        title: meta.title,
        author: meta.creator,
        publisher: meta.publisher,
        path: uri,
        bookmarks: [],
        highlights: [],
        bgColorFromCover: '',
        toc: parshToc(book),
        locations,
      };

      if (callback) {
        callback(info, book);
      }
    });
}

/**
 * 1. Registers epub files into db with their information
 * 2. Extract cover and also store color palette from cover
 * @param {String} file Path to epub file
 * @param {Database} db Database in which data stored
 * @param {Function} [cb] callback function
 */

function addToDB(file, db, cb) {
  getInfo(file, (info, book) => {
    const key = info.id;
    info.lastOpen = new Date().getTime();

    // return if book is allready registered
    if (db.has(key)) {
      if (cb) {
        cb(info, db);
      }
      return;
    }

    const coverPath = path.join(
      remote.app.getPath('appData'),
      'eplee',
      'cover',
      key
    );

    storeCover(book, coverPath, isSucces => {
      if (isSucces) {
        info.coverPath = fileUrl(coverPath);
        Vibrant.from(coverPath)
          .getPalette((err, palette) => {
            if (err) return;
            info.bgColorFromCover = palette.DarkVibrant.hex;
          })
          .then(() => {
            db.insert(key, info);
          })
          .then(() => {
            if (cb) {
              cb(info, db);
            }
          });
      } else {
        info.bgColorFromCover = '#6d6d6d';
        db.insert(key, info);

        if (cb) {
          cb(info, db);
        }
      }
    });
  });
}

export { addToDB, storeCover, genrateKey, getInfo, parshToc };
