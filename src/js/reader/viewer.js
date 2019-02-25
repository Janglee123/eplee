const path = require('path');
const db = remote.getGlobal('db');

Viewer = {};
Viewer.Controller = {}
Viewer.history = []


Viewer.init = function () {
    let bookPath = (new URL(document.location)).searchParams.get('bookPath');
    Viewer.metadata = {}
    Viewer.metadata._id = id = (new URL(document.location)).searchParams.get('id');
    console.log('Opennig Book', id, bookPath);
    Viewer.openBook(bookPath);
}

Viewer.openBook = function (bookPath) {
    Viewer.book = book = new ePub(bookPath, {});
    Viewer.rendition = rendition = book.renderTo('viewer', {
        width: "100%",
        height: "100%"
    });
    rendition.back = function () {
        Viewer.history.pop(); //current location
        prevCfi = Viewer.history.pop(); //prev location
        Viewer.rendition.display(prevCfi);
    }
    rendition.themes.register('dark', remote.getGlobal('path').theme);
    rendition.themes.fontSize('16px');
    Viewer.currentTheme = 'light';

    book.ready.then(() => {

        let meta = book.package.metadata;
        let toc = book.navigation.toc; // Table of Contents
        book.loaded.navigation.then((navigation) => {
            Viewer.loadToc(navigation.toc);
        });

        $('#book-title').html(book.package.metadata.title);
    }).then(() => {
        $('#loader').remove();
        rendition.display();
    })
}

Viewer.onBookReady = function () {
    console.log(Viewer.book.package.title);
}

Viewer.isbookmark = function (cfi) {
    return Viewer.metadata.bookmark.find(cfi) > 0;
}

Viewer.addBookmark = function (cfi) {
    Viewer.metadata.bookmark.push(cfi);
    /*db.update({_id:Viewer.metadata._id},{$pull : {bookmark:cfi}},{}, err => {
        if (err) console.error(err);
    });*/
}

Viewer.removeBookmark = function (cfi) {
    let index = Viewer.metadata.bookmark.find(cfi)
    Viewer.metadata.bookmark.splice(index, 1);

    /*db.update({_id:Viewer.metadata._id},{$push : {bookmark:cfi}},{}, err => {
        if (err) console.error(err);
    });*/
}

Viewer.loadToc = function (toc) {
    $toc = $('#toc');

    let validateHref = function (href) {
        if (href.startsWith('..'))
            href = href.substring(2);
        if (href.startsWith('/'))
            href = href.substring(1);
        return href
    }

    toc.forEach(h3 => {
        href = validateHref(h3.href);
        console.log(href);
        $toc.append(`<h3 onclick="Viewer.Controller.onTocItemClick('${href}')" >${h3.label}</h3>`);
        if (h3.subitems) {
            h3.subitems.forEach(h4 => {
                href = validateHref(h4.href);
                console.log(href);
                $toc.append(`<h4 onclick="Viewer.Controller.onTocItemClick('${href}')">${h4.label}</h4>`);
                if (h4.subitems) {
                    h4.subitems.forEach(h5 => {
                        href = validateHref(h5.href);
                        console.log(href);
                        $toc.append(`<h5 onclick="Viewer.Controller.onTocItemClick('${href}')" >${h5.label}</h5>`);
                    });
                }
            });
        }
    });
}

Viewer.search = function () { }

$(document).ready(() => {

    Viewer.init();
    Viewer.Controller.onClick();
    Viewer.Controller.onKey();
    Viewer.Controller.rendition();
})