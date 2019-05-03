<template>
	<el-container direction="vertical">
		<titlebar add backdrop shadow />
		<el-main>
			<ul id="list">
				<li v-for="book in bookList" :key="book.id">
					<card :id="book.id" :title="book.title" :img-src="book.coverPath" />
				</li>
			</ul>
		</el-main>
	</el-container>
</template>

<script>
import path from 'path';
import fileUrl from 'file-url';
import MagicGrid from 'magic-grid';
import Card from './Home/Card';
import Titlebar from './Titlebar';
import { storeCover, getInfo } from '../../shared/dbUtilis.js';
export default {
  name: 'Home',
  components: {
    Card,
    Titlebar,
  },
  data() {
    return {
      bookList: [],
    };
  },

  mounted() {
    this.bookList = this.$db.getAll();

    this.$bus.on('add-button', () => {
      this.addFiles();
    });

    const magicGrid = new MagicGrid({
      container: '#list',
      static: false,
      items: this.bookList.length,
      gutter: 30, 
      animate: true, 
    });
  magicGrid.listen();
  },
  

  methods: {
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
        if (this.$db.has(key)) {
          return;
        }

        const coverPath = path.join(this.$dataPath, 'cover', key);
        info.coverPath = fileUrl(coverPath);

        storeCover(book, coverPath, () => {
          try {
            this.$db.insert(key, info);
          } catch (err) {
            console.log(err);
          }
          this.bookList.push(info);
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

ul {
  list-style: none;
  padding: 0px;
}

li {
  min-width: 170px;
  max-width: 170px;
}

li a {
  text-decoration: none;
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
