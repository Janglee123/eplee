<template>
	<div>
		<el-container direction="vertical">
			<titlebar
				ref="titlebar"
				back
				library
				menu
				bookmark
				search
				:title="title"
				:bookmarks="info.bookmarks"
				:toc="toc"
				:search-result="searchResult"
			/>
			<el-main class="container">
				<el-button id="prev" circle size="small" icon="el-icon-arrow-left" @click="prevPage" />
				<div id="reader" v-loading="!isReady" />
				<el-button id="next" circle size="small" icon="el-icon-arrow-right" @click="nextPage" />
			</el-main>
			<el-footer>
				<el-slider v-model="sliderValue" v-bind:step="0.01" @change="onSliderValueChange"></el-slider>
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
	</div>
</template>

<script>
import { Book, Rendition } from 'epubjs';
import translate from '@vitalets/google-translate-api';
import Titlebar from './Titlebar';

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
    };
  },

  mounted() {
    const { id } = this.$route.params;
    this.info = this.$db.get(id);
    this.info.lastOpen = new Date().getTime();
    
    this.book = new Book(this.info.path);
    this.rendition = new Rendition(this.book, {
      width: '100%',
      height: '100%',
    });

    this.rendition.on('selected', (cfiRange, contents) => {
      // rect of selection
      this.createPopover(contents,cfiRange);
      this.selection.cfiRange = cfiRange;
      this.book.getRange(cfiRange).then(range => {
        let text = range.toString();
        this.selection.text = text;
        this.showPopover();
        this.translateSelection();
      });
    });

    this.rendition.on('relocated', location => {
      this.info.lastCfi = location.start.cfi;
      this.$db.set(this.info.id, this.info);
      this.progress = this.book.locations.percentageFromCfi(location.start.cfi);
      this.sliderValue = Math.floor(this.progress*10000)/100;
    });

    this.book.ready
      .then(() => {
        this.meta = this.book.package.metadata;
        this.toc = this.parshToc(this.book.navigation.toc);
        this.title = this.meta.title;
      }).then(()=>{
        return  this.book.locations.generate();
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
      // At this momment I used herf as a title. It is not easy to get title by current location. see issue.
      const title = href;

      const bookmark = {
        label: title,
        cfi,
        href,
      };

      this.info.bookmarks.push(bookmark);
      this.$db.set(this.info.id, this.info);
    },

    parshToc(toc) {
      const tocTree = [];

      const validateHref = href => {
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

    setShortcuts() {
      this.$bind(
        this.$electron.remote.getCurrentWindow(),
        'Left',
        this.prevPage
      );
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
    },

    bindTitlebarBottuns() {
      this.$bus.on('toc-item-clicked', herf => {
        this.rendition.display(herf);
        this.isMenuVisible = false;
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
    onSliderValueChange(newValue){
      let cfi = this.book.locations.cfiFromPercentage(newValue/100);
      this.rendition.display(cfi);
    },
  }
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
.select-popper {
  padding: 0px;
}
</style>
