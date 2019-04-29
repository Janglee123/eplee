<template>
  <el-container direction="vertical">
    <titlebar
      back
      library
      menu
      :title="title"
    />
    <sidebar
      v-if="isMenuVisible"
      :toc="toc"
    />
    <el-main class="container">
      <el-button
        id="prev"
        circle
        icon="el-icon-arrow-left"
        @click="prevPage"
      />
      <div id="reader" />
      <el-button
        id="next"
        circle
        icon="el-icon-arrow-right"
        @click="nextPage"
      />
    </el-main>
  </el-container>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import Titlebar from './Titlebar';
import Sidebar from './Reader/Sidebar';

export default {
  name: 'Reader',
  components: {
    Titlebar,
    Sidebar,
  },
  props: {},

  data() {
    return {
      isMenuVisible: false,
      title: '',
      toc: [],
      meta: {},
      path: '',
      fontSize:14,
    };
  },

  mounted() {
    this.path = this.$route.params.id;

    this.book = new Book(this.path);
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
    this.$bus.on('toc-item-clicked', (herf)=>{
      console.log(herf);
      this.rendition.display(herf);
    });

    this.$bind(this.$electron.remote.getCurrentWindow(),'Left', this.prevPage);
    this.$bind(this.$electron.remote.getCurrentWindow(),'Right', this.nextPage);
    this.$bind(this.$electron.remote.getCurrentWindow(),'CommandOrControl+Up', this.increseFontSize);
    this.$bind(this.$electron.remote.getCurrentWindow(),'CommandOrControl+Down', this.decreaseFontSize);


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
      });
  },
  methods: {
    nextPage() {
      this.rendition.next();
    },
    prevPage() {
      this.rendition.prev();
    },
    increseFontSize(){
      this.fontSize += 2;
      this.rendition.themes.fontSize(`${this.fontSize  }px`);
      this.$message({
          message: `Font Size : ${  this.fontSize  }px`,
          center: true,
          duration: 1000,
      });
    },
    decreaseFontSize(){
      this.fontSize -= 2;
      this.rendition.themes.fontSize(`${this.fontSize  }px`);
      this.$message({
          message: `Font Size : ${  this.fontSize  }px`,
          center: true,
          duration: 1000,

      });
    },
    parshToc(toc) {
      const tocTree = [];

      const validateHref = (href) => {
        if (href.startsWith('..')) href = href.substring(2);
        if (href.startsWith('/')) href = href.substring(1);
        return href;
      };

      // create Toc tree recursively
      const createTree = (toc, parrent) => {
        for (let i = 0; i < toc.length; i+=1) {
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

<style scoped>
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
  border-radius: 15px;
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
  flex-grow: 1;
  flex-basis: auto;
}

.el-button {
  z-index: 2;
  flex-grow: 0;
  flex-basis: auto;
}
</style>
