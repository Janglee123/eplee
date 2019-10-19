<template>
	<el-container direction="vertical">
		<titlebar :title="title">
			<el-button-group>
				<el-button size="small" icon="el-icon-back" circle @click="onBackBtn" />
				<el-button size="small" icon="el-icon-s-grid" circle @click="onLibraryBtn" />
			</el-button-group>

			<toc-menu :toc="toc" :theme="theme" @node-click="onNodeClick"></toc-menu>

			<bookmark-menu
				:bookmarks="info.bookmarks"
				:theme="theme"
				@node-click="onNodeClick"
				@add-bookmark="addBookmark"
				@remove-bookmark="removeBookmark"
			/>

			<search-menu
				:search-result="searchResult"
				:theme="theme"
				@node-click="onNodeClick"
				@search="search"
			/>

			<theme-menu
				@theme-change="applytheme"
				@flow-change="applyflow"
				@style-change="updateStyle"
			/>
		</titlebar>

		<el-main class="container">
			<div id="reader" v-loading="!isReady" />
		</el-main>

		<el-footer height="45">
			<el-slider v-model="sliderValue" :step="0.01" :format-tooltip="lableFromPercentage" @change="onSliderValueChange"></el-slider>
		</el-footer>

		<buble-menu ref="bubleMenu" @highlight-btn-click="highlightSelection" />
	</el-container>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import Titlebar from '../components/Titlebar';
import TocMenu from '../components/Reader/TocMenu';
import BookmarkMenu from '../components/Reader/BookmarkMenu';
import SearchMenu from '../components/Reader/SearchMenu';
import ThemeMenu from '../components/Reader/ThemeMenu';
import BubleMenu from '../components/Reader/BubleMenu';
import { dark, tan } from '../../shared/themes';
import { selectListener, clickListener, swipListener, wheelListener, keyListener } from '../components/Reader/listener/listener';

export default {
  name: 'Reader',
  components: {
    Titlebar,
    TocMenu,
    BookmarkMenu,
    SearchMenu,
    ThemeMenu,
    BubleMenu,
  },
  props: {},

  data() {
    return {
      isReady: false,
      title: '',
      toc: [],
      searchResult: [],
      info: {},
      sliderValue: 0,
      progress: 0,
      currentChapter: '',
      history: [],
      searchText: '',
      margin: 0,
      theme: 'default',
      styleRules: {},
      rendition: {},
      book: {},
    };
  },

  watch: {

  },
  mounted() {
    let { id } = this.$route.params;

    if (process.platform === 'win32') {
        id = id.split('\\').pop();
    }
    this.info = this.$db.get(id);
    this.toc = this.info.toc;
    this.info.lastOpen = new Date().getTime();
    this.buble = this.$refs.bubleMenu
    this.book = new Book(this.info.path);

    this._flattenedToc = (function flatten(items) {
      return [].concat(...items.map(item => [item].concat(...flatten(item.children))));
    })(this.toc);

    this._flattenedToc.sort((a,b)=>{
      return a.percentage - b.percentage;
    })

    this.rendition = new Rendition(this.book, {
      width: '100%',
      height: '100%',
    });

    this.rendition.on('rendered', (e, iframe) => {
      clickListener(iframe.document, this.rendition, this.flipPage);
      selectListener(iframe.document, this.rendition, this.toggleBuble);
      swipListener(iframe.document,  this.flipPage);
      wheelListener(iframe.document, this.flipPage);
      keyListener(iframe.document, this.flipPage);
    });

    this.rendition.on('relocated', location => {
      this.info.lastCfi = location.start.cfi;
      this.$db.set(this.info.id, this.info);
      this.history.push(location.start.cfi);

      this.progress = this.book.locations.percentageFromCfi(location.start.cfi);
      this.sliderValue = Math.floor(this.progress * 10000) / 100;
    });

    this.rendition.hooks.content.register(this.applyStyle);

    this.book.ready
      .then(() => {
        this.meta = this.book.package.metadata;
        this.title = this.meta.title;
        this.book.locations.load(this.info.locations);
      })
      .then(() => {
        this.rendition.attachTo(document.getElementById('reader'));
        this.rendition.display(this.info.lastCfi || 1);
        this.rendition.themes.registerRules('dark',dark);
        this.rendition.themes.registerRules('tan', tan);
        this.rendition.ready = true;
        this.theme = this.$store.getters.theme;
        this.applytheme(this.theme);
      })
      .then(()=>{
        this.info.highlights.forEach(cfiRange=>{
          this.rendition.annotations.highlight(cfiRange);
        });
      })
      .then(() => {
        this.isReady = true;
        console.log(this.book);
        console.log(this.rendition);
      });
  },

  methods: {

    search(text) {
      return Promise.all(
        this.book.spine.spineItems.map(item =>
          item
            .load(this.book.load.bind(this.book))
            .then(item.find.bind(item, text))
            .finally(item.unload.bind(item))
        )
      )
        .then(results => results.flat())
        .then(results => {
          this.searchResult = results.map(result => {
            result.label = result.excerpt;
            return result;
          });
        }).then(()=>{
          this.$remote.getCurrentWebContents().findInPage(text);
        })
    },

    flipPage(direction){
      if(direction === 'next') this.nextPage();
      else if(direction === 'prev') this.prevPage();
    },

    toggleBuble(event, react, text, cfiRange){
      if(event==='cleared'){
        // hide buble
        this.buble.hide();
        return;
      }
      this.buble.setProps(react, text, cfiRange);
      this.isBubleVisible = true;
    },

    refreshRendition(){
      // re-render to apply theme properly
      // trick to rerender is resize render
      if(this.rendition.manager){
        this.rendition.resize(0, 0);
        this.rendition.resize('100%', '100%');
      }
    },

    highlightSelection(cfiRange) {
      this.rendition.annotations.highlight(cfiRange);
      this.info.highlights.push(cfiRange);
      this.$db.set(this.info.id, this.info);
    },

    nextPage() {
      this.rendition.next();
    },

    prevPage() {
      this.rendition.prev();
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
      const { href, cfi, percentage } = location.start;

      // TODO : find more minigful name for bookmark
      const title = `${this.lableFromPercentage(percentage*100)} : At ${Math.floor(
        this.progress * 1000
      ) / 10}%`;

      const bookmark = {
        label: title,
        cfi,
        href,
      };

      this.info.bookmarks.push(bookmark);
      this.$db.set(this.info.id, this.info);
    },

    onNodeClick(item) {
      this.rendition.display(item.cfi || item.href);
    },

    onBackBtn() {
      // remove current location
      this.history.pop();

      let lastLocation = this.history.pop();

      if (lastLocation) {
        this.rendition.display(lastLocation);
      } else {
        // go to homepage
        this.$router.push('/');
      }
    },

    onLibraryBtn() {
      this.$router.push('/');
    },

    onSliderValueChange(newValue) {
      let cfi = this.book.locations.cfiFromPercentage(newValue / 100);
      this.rendition.display(cfi);
    },

    updateStyle(rules){
      this.styleRules = rules;
      this.applyStyle();
      this.refreshRendition();
    },

    applyflow(flow){
      if(!this.rendition.ready) return;
      this.rendition.flow(flow);
    },

    applyStyle(){
      if(!this.rendition.ready) return;

      this.rendition.getContents().forEach( (content) => {
			  content.addStylesheetRules(this.styleRules);
      });
    },

    applytheme(theme) {
      this.theme = theme;
      this.rendition.themes.select(theme);
      this.refreshRendition();
      this.$bus.emit('theme-change', theme);
    },

    tocFromPercentage(percent){

      if(!this._flattenedToc) return {};

      percent /= 100;

      for(let i = 0 ; i < this._flattenedToc.length ; i+=1 ){
        if(this._flattenedToc[i].percentage > percent){
          return this._flattenedToc[i-1];
        }
      }

      return null;
    },

    lableFromPercentage(percent){
      let toc = this.tocFromPercentage(percent)
      if(toc) return toc.label;
      return '';
    }
  },
};
</script>


<style lang="scss" scoped>
@import '../assets/style';

#reader {
  user-select: none;
  height: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  margin: 5px;
}
</style>

<style>

.popper {
  height: 85%;
}

.el-tree {
  max-height: 95%;
  max-width: 100%;
  overflow: auto;
  word-wrap: wrap;
}

.el-table {
  min-height: 94%;
  max-height: 94%;
  overflow: auto;
}

.el-table__row {
  user-select: none;
  cursor: pointer;
}
</style>
