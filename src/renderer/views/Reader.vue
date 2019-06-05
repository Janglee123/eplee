<template>
	<el-container direction="vertical">
		<titlebar
			ref="titlebar"
			search
			:title="title"
			:search-result="searchResult"
		>
			<el-button-group>
				<el-button size="small" icon="el-icon-back" circle @click="onBackBtn" />
				<el-button size="small" icon="el-icon-s-grid" circle @click="onLibraryBtn" />
			</el-button-group>

			<el-popover popper-class="popper" placement="bottom" width="350" trigger="hover">
				<div class="el-popover__title">
					Table of Content
				</div>
				<el-button slot="reference" size="small" icon="el-icon-reading" circle />
				<el-tree :data="toc" @node-click="onNodeClick" />
			</el-popover>

			<el-popover popper-class="popper" width="350" trigger="hover">
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
			
			<el-popover popper-class="popper" width="350" trigger="click"
				@show="startSearch"
				@hide="stopSearch"
			>
				<el-button slot="reference" size="small" icon="el-icon-search" circle />
				<div class="el-popover__title">
					<el-input	v-model="searchText"	size="small"	width="300"	placeholder="search" />
				</div>
				<el-table :show-header="false" :data="searchResult" @cell-click="onNodeClick">
					<el-table-column prop="label" width="350"></el-table-column>
				</el-table>
			</el-popover>
		</titlebar>


		<el-main class="container">
			<el-button id="prev" circle size="small" icon="el-icon-arrow-left" @click="prevPage" />
			<div id="reader" v-loading="!isReady" />
			<el-button id="next" circle size="small" icon="el-icon-arrow-right" @click="nextPage" />
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
      fontSize: 14,
      selection: {},
      translateTo: 'gu',
      translatedText: '',
      isPopover: false,
      sliderValue: 0,
      progress: 0,
      currentChapter: '',
      history: [],
      searchText: '',
    };
  },

  watch:{
    searchText(){
      
      if (this.searchText === '') {
        return;
      }

      clearTimeout(this._searcTimer);
      this._searcTimer = setTimeout(()=>{
        this.search(this.searchText)
        .then(()=>{
          this.startSearch();
        })
      }, 1000);
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
      let { label } = this.book.navigation.get(e.href);
      this.currentChapter = label.trim();
      iframe.document.documentElement.addEventListener('wheel',this.wheelHandel);
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
        this.book.locations.load(this.info.locations)
      })
      .then(() => {
        this.rendition.attachTo(document.getElementById('reader'));
        this.rendition.themes.fontSize(100);
        this.rendition.display(this.info.lastCfi || 1);
      })
      .then(() => {
        this.isReady = true;
        console.log(this.book);
        console.log(this.rendition);
      });

    this.setShortcuts();
    this.bindTitlebarBottuns();
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

    increseFontSize() {
      this.fontSize += 2;
      this.rendition.themes.fontSize(`${this.fontSize}px`);
      this.$message({
        message: `Font Size : ${this.fontSize}px`,
        center: true,
        duration: 500,
      });
    },

    wheelHandel(e) {
      clearTimeout(this._isScrolling);

      this._isScrolling = setTimeout(() => {
        if (e.deltaY > 0) {
          this.nextPage();
        } else {
          this.prevPage();
        }
      }, 50);
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
      const { href, cfi } = location.start;

      // TODO : find more minigful name for bookmark
      const title = `${this.currentChapter} : At ${Math.floor(this.progress*1000)/10}%`;

      const bookmark = {
        label: title,
        cfi,
        href,
      };

      this.info.bookmarks.push(bookmark);
      this.$db.set(this.info.id, this.info);
    },

    
    setShortcuts() {
      this.$bind(
        this.$remote.getCurrentWindow(),
        'Left',
        this.prevPage
      );
      this.$bind(
        this.$remote.getCurrentWindow(),
        'Right',
        this.nextPage
      );
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

    bindTitlebarBottuns() {
      this.$bus.on('toc-item-clicked', href => {
        this.rendition.display(href);
      });

      this.$bus.on('add-bookmark-button', () => {
        this.addBookmark();
      });

      this.$bus.on('remove-bookmark-button', bookmark => {
        this.removeBookmark(bookmark);
      });

      this.$bus.on('search-input', text => {
        this.search(text);
      });
    },

    onNodeClick(item){
        this.rendition.display(item.cfi || item.href);
    },

    onBackBtn(){
        // remove current location 
        this.history.pop();

        let lastLocation = this.history.pop();

        if(lastLocation){
          this.rendition.display(lastLocation); 
        }
        else{
          // go to homepage
          this.$router.push('/');
        }
    },
    onLibraryBtn(){
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
  },
};
</script>


<style lang="scss" scoped>
@import '../assets/style';

.el-main {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;

  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0px;
}

#reader {
  user-select: none;
  width: 80%;
  height: 100%;
  flex-grow: 2;
  flex-basis: auto;
}

.el-button {
  flex-grow: 0;
  flex-basis: auto;
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