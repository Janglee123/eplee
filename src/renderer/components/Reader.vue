<template>
	<el-container direction="vertical">
		<titlebar back library menu bookmark :title="title" :bookmarks="info.bookmarks" :toc="toc" />
		<el-main class="container">
			<el-button id="prev" circle size="small" icon="el-icon-arrow-left" @click="prevPage" />
			<div id="reader" v-loading="!isReady" />
			<el-button id="next" circle size="small" icon="el-icon-arrow-right" @click="nextPage" />
		</el-main>
		<!-- <el-footer>
      <el-slider></el-slider>
    </el-footer>-->
	</el-container>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import Titlebar from './Titlebar';

export default {
  name: 'Reader',
  components: {
    Titlebar,
  },
  props: {},

  data() {
    return {
      isMenuVisible: false,
      isReady: false,
      title: '',
      toc: [],
      info: {},
      path: '',
      fontSize: 14,
    };
  },

  mounted() {
    const { id } = this.$route.params;
    this.info = this.$db.get(id);
    this.book = new Book(this.info.path);

    this.rendition = new Rendition(this.book, {
      width: '100%',
      height: '100%',
    });

    this.$bus.on('library-button', () => {
      this.$router.push('/');
    });

    this.$bus.on('menu-button', () => {
      this.isMenuVisible = !this.isMenuVisible;
    });

    this.$bus.on('toc-item-clicked', (herf) => {
      this.rendition.display(herf);
      this.isMenuVisible = false;
    });

    this.$bus.on('add-bookmark-button', () => {
      this.addBookmark();
    });

    this.$bus.on('remove-bookmark-button', (bookmark) => {
      this.removeBookmark(bookmark);
    });

    this.$bind(this.$electron.remote.getCurrentWindow(), 'Left', this.prevPage);
    this.$bind(
      this.$electron.remote.getCurrentWindow(),
      'Right',
      this.nextPage
    );
    this.$bind(
      this.$electron.remote.getCurrentWindow(),
      'CommandOrControl+Up',
      this.increseFontSize
    );
    this.$bind(
      this.$electron.remote.getCurrentWindow(),
      'CommandOrControl+Down',
      this.decreaseFontSize
    );

    this.book.ready
      .then(() => {
        this.meta = this.book.package.metadata;
        this.toc = this.parshToc(this.book.navigation.toc);
        this.title = this.meta.title;
      })
      .then(() => {
        this.rendition.attachTo(document.getElementById('reader'));
        this.rendition.themes.fontSize(`${this.fontSize}px`);
        this.rendition.display(1);

        // this.$refs.sidebar.setToc(this.toc);
      })
      .then(() => {
        this.isReady = true;
        console.log(this.book);
        console.log(this.rendition);
      });
  },
  methods: {
    nextPage() {
      this.rendition.next();
    },
    prevPage() {
      this.rendition.prev();
    },
    increseFontSize() {
      this.fontSize += 2;
      this.rendition.themes.fontSize(`${this.fontSize}px`);
      this.$message({
        message: `Font Size : ${this.fontSize}px`,
        center: true,
        duration: 500,
      });
    },
    decreaseFontSize() {
      this.fontSize -= 2;
      this.rendition.themes.fontSize(`${this.fontSize}px`);
      this.$message({
        message: `Font Size : ${this.fontSize}px`,
        center: true,
        duration: 500,
      });
    },

    removeBookmark(bookmark) {
      const index = this.info.bookmarks.findIndex(
        item => item.cfi === bookmark.cfi
      );
      this.info.bookmarks.splice(index, 1);
      this.$db.insert(this.info.id, this.info);
    },
    addBookmark() {
      /**
       * prefred structure of bookmark object
       *  let bookmark = {
       *  title:'',// title of page of topic where bookmark is placed
       *  cfi:'', // cfi of location
       *  href:'' // href of location
       * }
       */

      const { location } = this.rendition;
      const { href } = location.start;
      const { cfi } = location.start;
      const title = this.currentSubTitle || href;

      const bookmark = {
        label: title,
        cfi,
        href,
      };

      this.info.bookmarks.push(bookmark);
      this.$db.insert(this.info.id, this.info);
    },

    parshToc(toc) {
      const tocTree = [];

      const validateHref = (href) => {
        if (href.startsWith('..')) {
          href = href.substring(2);
        }
        if (href.startsWith('/')) {
          href = href.substring(1);
        }
        return href;
      };

      // create Toc tree recursively
      const createTree = (toc, parrent) => {
        for (let i = 0; i < toc.length; i += 1) {

          parrent[i] = {
            label: toc[i].label.trim(),
            children: [],
            href: validateHref(toc[i].href),
          };
          
          if (toc[i].subitems) {
            createTree(toc[i].subitems, parrent[i].children);
          }
        }
      };

      createTree(toc, tocTree);
      return tocTree;
    },
  },
};
</script>


<style lang="less" scoped>
@import '../assets/style';

.el-container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  border: 1px solid #d7dae2;
  background-color: #ffffff;
  border-radius: @border-radius;
}

.el-main {
  position: relative;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;

  width: 100%;
  height: 100%;
  overflow: hidden;
}

#reader {
  user-select: none;
  width: 80%;
  height: 100%;
  flex-grow: 2;
  flex-basis: auto;
}

.el-button {
  z-index: 2;
  flex-grow: 0;
  flex-basis: auto;
}

footer {
  width: 100%;
}

.el-slider {
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
}
</style>


<style>
</style>
