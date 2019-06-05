<template>
	<el-container direction="vertical">
		<titlebar :title="title">
			<el-button-group>
				<el-button size="small" icon="el-icon-back" circle @click="onBackBtn" />
				<el-button size="small" icon="el-icon-s-grid" circle @click="onLibraryBtn" />
			</el-button-group>

			<el-popover :popper-class="`popper ${theme}`" placement="bottom" width="350" trigger="hover">
				<div class="el-popover__title">
					Table of Content
				</div>
				<el-button slot="reference" size="small" icon="el-icon-reading" circle />
				<el-tree :data="toc" @node-click="onNodeClick" />
			</el-popover>

			<el-popover :popper-class="`popper ${theme}`" width="350" trigger="hover">
				<div class="el-popover__title">
					Bookmarks
					<el-button size="mini" icon="el-icon-plus" circle @click="addBookmark" />
				</div>
				<el-button slot="reference" size="small" icon="el-icon-collection-tag" circle />
				<el-tree :data="info.bookmarks" node-key="id" @node-click="onNodeClick">
					<span slot-scope="{ node }" class="custom-tree-node">
						<span>{{ node.label }}</span>
						<span>
							<el-button type="text" icon="el-icon-close" @click="() => removeBookmark(node)" />
						</span>
					</span>
				</el-tree>
			</el-popover>

			<el-popover
				:popper-class="`popper ${theme}`"
				width="350"
				trigger="hover"
				@show="startSearch"
				@hide="stopSearch"
			>
				<el-button slot="reference" size="small" icon="el-icon-search" circle />
				<div class="el-popover__title">
					<el-input v-model="searchText" size="small" width="300" placeholder="search" />
				</div>
				<el-table :show-header="false" :data="searchResult" @cell-click="onNodeClick">
					<el-table-column prop="label" width="350"></el-table-column>
				</el-table>
			</el-popover>

			<el-popover placement="bottom" :popper-class="theme" trigger="hover">
				<el-button slot="reference" size="small" icon="el-icon-s-operation" circle />
				<div style="margin-bottom:10px;">
					Flow   
					<el-radio-group v-model="flow" size="small">
						<el-radio-button label="paginated" border>
							Paged
						</el-radio-button>
						<el-radio-button label="scrolled-doc" border>
							Scrolled
						</el-radio-button>
					</el-radio-group>
				</div>
				<div style="margin-bottom:10px">
					Theme   
					<el-radio-group v-model="theme" size="small">
						<el-radio-button label="default" border>
							Light
						</el-radio-button>
						<el-radio-button label="tan" border>
							Tan
						</el-radio-button>
						<el-radio-button label="dark" border>
							Dark
						</el-radio-button>
					</el-radio-group>
				</div>
				
				<div style="margin-bottom:10px">
					Line Spacing
					<el-input-number v-model="lineSpacing" :precision="2" :step="0.1" :min="1.3" :max="2.0" size="mini"></el-input-number>
				</div>

				<div style="margin-bottom:10px">
					Font Size
					<el-input-number v-model="fontSize" :step="10" :min="10" :max="300" size="mini"></el-input-number>
				</div>

				<div style="margin-bottom:10px">
					Font
					<el-select v-model="font" size="mini">
						<el-option label="Default" value=""></el-option>
						<el-option label="Arial" value="Arial"></el-option>
						<el-option label="Times New Roman" value="Times New Roman"></el-option>
					</el-select>
				</div>
			</el-popover>
		</titlebar>

		<el-main class="container">
			<div id="reader" v-loading="!isReady" />
		</el-main>

		<el-footer height="45">
			<el-slider v-model="sliderValue" :step="0.01" @change="onSliderValueChange"></el-slider>
		</el-footer>

		<el-popover v-model="isPopover" popper-class="select-popper" trigger="hover">
			<el-button-group>
				<el-button size="medium" icon="el-icon-brush" @click="highlightSelection"></el-button>
				<el-button size="medium" icon="el-icon-copy-document" @click="copySelection"></el-button>
				<el-button
					v-popover:translatePop
					size="medium"
					icon="el-icon-collection"
					@click="translateSelection"
				></el-button>
			</el-button-group>

			<el-popover ref="translatePop" width="200" trigger="hover">
				<div class="el-popover__title">
					<el-input v-model="translateTo" placeholder="Language Code" width="30" size="mini">
						<template slot="prepend">
							Translate to
						</template>
					</el-input>
				</div>
				{{ translatedText }}
			</el-popover>

			<span
				slot="reference"
				ref="popRef"
				style="position:absolute"
				@focus="showPopover"
				@onmouseout="hidePopover"
			></span>
		</el-popover>
	</el-container>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import translate from '@vitalets/google-translate-api';
import Titlebar from '../components/Titlebar';
import { dark, tan } from '../../shared/themes'

export default {
  name: 'Reader',
  components: {
    Titlebar,
  },
  props: {},

  data() {
    return {
      isReady: false,
      title: '',
      toc: [],
      searchResult: [],
      info: {},
      path: '',
      fontSize: 100,
      selection: {},
      translateTo: 'gu',
      translatedText: '',
      isPopover: false,
      sliderValue: 0,
      progress: 0,
      currentChapter: '',
      history: [],
      searchText: '',
      margin: 0,
      lineSpacing: 1.5,
      theme: 'default',
      flow: 'paginated',
      font: '',
    };
  },

  watch: {
    searchText() {
      if (this.searchText === '') {
        return;
      }

      clearTimeout(this._searcTimer);
      this._searcTimer = setTimeout(() => {
        this.search(this.searchText).then(() => {
          this.startSearch();
        });
      }, 1000);
    },
    
    theme(theme) {
      this.rendition.themes.select(theme);
      this.refreshRendition();
      this.$bus.emit('theme-change', theme);
    },

    lineSpacing(){
      this.applyStyle();
    },
    flow(value){
      this.rendition.flow(value);
    },
    fontSize(){
      this.applyStyle();
    },
    font(){
      this.applyStyle();
      this.refreshRendition();
    }
  },
  mounted() {
    const { id } = this.$route.params;
    this.info = this.$db.get(id);
    this.toc = this.info.toc;
    this.info.lastOpen = new Date().getTime();

    this.book = new Book(this.info.path);

    this.rendition = new Rendition(this.book, {
      width: '100%',
      height: '100%',
    });

    this.rendition.on('selected', (cfiRange, contents) => {
      // rect of selection
      this.createPopover(contents, cfiRange);
      this.selection.cfiRange = cfiRange;
      this.book.getRange(cfiRange).then(range => {
        let text = range.toString();
        this.selection.text = text;
        this.showPopover();
        this.translateSelection();
      });
    });

    this.rendition.on('rendered', (e, iframe) => {
      iframe.document.documentElement.addEventListener(
        'wheel',
        this.wheelHandel
      );
      
      this.applyStyle();
      // let { label } = this.book.navigation.get(e.href);
      // this.currentChapter = label.trim();
    });

    this.rendition.on('relocated', location => {
      this.info.lastCfi = location.start.cfi;
      this.$db.set(this.info.id, this.info);
      this.history.push(location.start.cfi);
      this.progress = this.book.locations.percentageFromCfi(location.start.cfi);
      this.sliderValue = Math.floor(this.progress * 10000) / 100;
    });

    this.book.ready
      .then(() => {
        this.meta = this.book.package.metadata;
        this.title = this.meta.title;
        this.book.locations.load(this.info.locations);
      })
      .then(() => {
        this.rendition.attachTo(document.getElementById('reader'));
        this.rendition.themes.fontSize(100);
        this.rendition.display(this.info.lastCfi || 1);
        this.rendition.themes.registerRules('dark',dark);
        this.rendition.themes.registerRules('tan', tan);
        this.theme = this.$store.getters.theme;
      })
      .then(() => {
        this.isReady = true;
        console.log(this.book);
        console.log(this.rendition);
      });

    this.setShortcuts();
  },

  methods: {
    search(q) {
      return Promise.all(
        this.book.spine.spineItems.map(item =>
          item
            .load(this.book.load.bind(this.book))
            .then(item.find.bind(item, q))
            .finally(item.unload.bind(item))
        )
      )
        .then(results => results.flat())
        .then(results => {
          this.searchResult = results.map(result => {
            result.label = result.excerpt;
            return result;
          });
        });
    },
    refreshRendition(){
      // re-render to apply theme properly
      // trick to rerender is resize render
      this.rendition.resize(0, 0);
      this.rendition.resize('100%', '100%');
    },
    showPopover() {
      this.isPopover = true;
    },

    hidePopover() {
      let reference = this.$refs.popRef;
      reference.style.visibility = 'hidden';
      this.isPopover = false;
    },

    createPopover(contents, cfiRange) {
      let viewRect = this.rendition.manager.container.getBoundingClientRect();
      let rect = contents.range(cfiRange).getBoundingClientRect();
      let reference = this.$refs.popRef;
      reference.style.left = `${viewRect.x + rect.x}px`;
      reference.style.top = `${viewRect.y + rect.y}px`;
      reference.style.width = `${rect.width}px`;
      reference.style.height = `${rect.height}px`;
    },

    copySelection() {
      const el = document.createElement('textarea');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.value = this.selection.text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },

    highlightSelection() {
      this.rendition.annotations.highlight(this.selection.cfiRange);
      this.info.highlight.push(this.cfiRange);
    },

    translateSelection() {
      let { text } = this.selection;
      translate(text, { to: this.translateTo }).then(res => {
        console.log(res.text);
        this.isTranslated = true;
        this.translatedText = res.text;
      });
    },

    nextPage() {
      this.rendition.next();
    },

    prevPage() {
      this.rendition.prev();
    },

    wheelHandel(e) {

      if(this.flow !== 'paginated'){
        return;
      }

      clearTimeout(this._isScrolling);

      this._isScrolling = setTimeout(() => {
        if (e.deltaY > 0) {
          this.nextPage();
        } else {
          this.prevPage();
        }
      }, 50);
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
      const { href, cfi } = location.start;

      // TODO : find more minigful name for bookmark
      const title = `${this.currentChapter} : At ${Math.floor(
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

    setShortcuts() {
      this.$bind(this.$remote.getCurrentWindow(), 'Left', this.prevPage);
      this.$bind(this.$remote.getCurrentWindow(), 'Right', this.nextPage);
      this.$bind(
        this.$remote.getCurrentWindow(),
        'CommandOrControl+Up',
        this.increseFontSize
      );
      this.$bind(
        this.$remote.getCurrentWindow(),
        'CommandOrControl+Down',
        this.decreaseFontSize
      );
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

    stopSearch() {
      this.$remote.getCurrentWebContents().stopFindInPage('clearSelection');
    },
    startSearch() {
      if (this.searchText.length === 0) {
        return;
      }
      this.$remote.getCurrentWebContents().findInPage(this.searchText);
    },

    applyStyle(){
      const rules = {
        'p':{
           "font-family": this.font !== "" ? `${this.font} !important` : "!invalid-hack",
           "font-size": this.fontSize !== "" ? `${this.fontSize} !important` : "!invalid-hack",
        },
        'body': {
            "font-family": this.font !== "" ? `${this.font} !important` : "!invalid-hack",
            // "text-align": `${theme.ta} !important`,
        },
        '*':{
          "line-height": `${this.lineSpacing} !important`,
          "font-size": this.fontSize !== "" ? `${this.fontSize}% !important` : "!invalid-hack",
        }
      };
      this.rendition.getContents().forEach( (content) => {
			  content.addStylesheetRules(rules);
      });
    },
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
.select-popper {
  padding: 0px;
}

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
