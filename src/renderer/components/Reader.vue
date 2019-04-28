<template>
  <el-container direction="vertical">
    <titlebar back library menu :title="title"></titlebar>
    <el-main class="container">
      <sidebar v-if="isMenuVisible" :toc="toc"></sidebar>
      <el-button circle id="prev" v-on:click="prevPage" icon="el-icon-arrow-left"></el-button>
      <div id="reader"></div>
      <el-button circle id="next" v-on:click="nextPage" icon="el-icon-arrow-right"></el-button>
    </el-main>
  </el-container>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import Titlebar from './Titlebar';
import Sidebar from './Reader/Sidebar';

let book = new Book('');
let rendition = new Rendition(book, {
  width: '100%',
  height: '100%',
});

export default {
  name: 'Reader',
  components: {
    Titlebar,
    Sidebar,
  },
  data() {
    return {
      isMenuVisible: false,
      title: '',
      toc:[],
      meta:{},
    };
  },
  mounted() {
    this.$bus.on('library-button', () => {
      this.$router.push('/');
    });
    this.$bus.on('menu-button', () => {
      this.isMenuVisible = !this.isMenuVisible;
    });

    book.ready
      .then(() => {
        this.meta = book.package.metadata;
        this.toc = this.parshToc(book.navigation.toc); // Table of Contents
        this.title = this.meta.title;
        console.log(this.meta);
        // console.log(this.toc);
      })
      .then(() => {
        rendition.attachTo(document.getElementById('reader'));
        rendition.display();
      });
  },
  methods: {
    nextPage() {
      console.log('next')
      rendition.next();
    },
    prevPage() {
      rendition.prev();
    },
    parshToc(toc) {
      let tocTree = [];

      let validateHref = function(href) {
        if (href.startsWith('..')) href = href.substring(2);
        if (href.startsWith('/')) href = href.substring(1);
        return href;
      };

      //create Toc tree recursively
      let createTree = function(toc,parrent){
        for(let i = 0; i < toc.length; i++){
          parrent[i] = {
            label : toc[i].label.trim(),
            children:[],
            href : validateHref(toc[i].href)
          };
          if(toc[i].subitems){
            createTree(toc[i].subitems,parrent[i].children)
          }
        }
      }

      createTree(toc,tocTree);
      console.log(toc);
      console.log(tocTree);
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
