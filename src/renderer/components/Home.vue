<template>
	<el-container direction="vertical">
		<titlebar add backdrop shadow />
		<el-main>
			<grid ref="grid" key="bookList.length">
				<card
					v-for="book in bookList"
					:id="book.id"
					:key="book.id"
					:title="trunc(book.title,30)"
					:img-src="book.coverPath"
					:bg-color="book.bgColorFromCover"
				/>
			</grid>
		</el-main>
	</el-container>
</template>

<script>
import path from 'path';
import fileUrl from 'file-url';
import * as Vibrant from 'node-vibrant';
import Grid from './Home/Grid';
import Card from './Home/Card';
import Titlebar from './Titlebar';
import { storeCover, getInfo } from '../../shared/dbUtilis.js';

console.log(Grid);

export default {
  name: 'Home',
  components: {
    Card,
    Titlebar,
    Grid,
  },
  data() {
    return {
      bookList: [],
    };
  },
  watch: {
    bookList(newList, oldList) {
      if (oldList.lenght === 0) return;
      this.$bus.emit('bookList-updated');
    },
  },
  beforeMount() {
    this.bookList = this.$db.getAll().sort((a, b) => {
      return b.lastOpen - a.lastOpen;
    });
  },
  mounted() {
    this.$bus.on('add-button', () => {
      this.addFiles();
    });
  },

  methods: {
    trunc(str, n) {
      return str.length > n ? `${str.substr(0, n - 3)}...` : str;
    },
    addFiles() {
      const files = this.$electron.remote.dialog.showOpenDialog({
        filters: [{ name: 'ePub', extensions: ['epub'] }],
        properties: ['openFile', 'multiSelections'],
      });
      if (files) {
        files.forEach(file => {
          this.addToDB(file);
        });
      }
    },

    addToDB(file) {
      getInfo(file, (info, book) => {
        const key = info.id;
        info.lastOpen = new Date().getTime();

        if (this.$db.has(key)) {
          return;
        }

        const coverPath = path.join(this.$dataPath, 'cover', key);

        storeCover(book, coverPath, isSucces => {
          if (isSucces) {
            info.coverPath = fileUrl(coverPath);
            Vibrant.from(coverPath).getPalette((err, palette) => {
              if (err) return;
              info.bgColorFromCover = palette.DarkVibrant.hex;
            }).then(()=>{
              this.$db.insert(key, info);
              this.bookList.push(info);
            });
          }
        });
      });
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
  border: 1px solid #d7dae2;
  background-color: #ffffff;
  border-radius: @border-radius;
  height: -webkit-fill-available;
}

#left {
  left: 10px;
  float: left;
  -webkit-app-region: no-drag !important;
}

#center {
  left: 50%;
  right: 50%;
}

#right {
  right: 10px;
  float: right;
  -webkit-app-region: no-drag !important;
}
</style>
