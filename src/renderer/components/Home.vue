<template>
  <el-container direction="vertical">
    <titlebar
      add
      search
      shadow
    />
    <el-main>
      <ul>
        <li
          v-for="book in bookList"
          :key="book.id"
        >
          <card
            :id="book.id"
            :title="book.title"
          />
        </li>
      </ul>
    </el-main>
  </el-container>
</template>

<script>
import { Book } from 'epubjs';
import Card from './Home/Card';
import Titlebar from './Titlebar';

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
    this.bookList = this.$db.getList().map(book => {
      book.title =
        book.title.length > 35
          ? `${book.title.substring(0, 35)}...`
          : book.title;
      return book;
    });

    this.$bus.on('add-button', () => {
      this.addFiles();
    });
  },

  methods: {
    addFiles() {
      const files = this.$electron.remote.dialog.showOpenDialog({
        filters: [{ name: 'ePub', extensions: ['epub'] }],
        properties: ['openFile', 'multiSelections'],
      });
      if (!files) {
        return;
      }

      files.forEach(file => {
        this.addToDB(file);
      });
    },

    addToDB(file) {
      file = `file://${file}`;
      console.log({ file });
      const book = new Book(file);
      book.ready.then(() => {
        console.log(book);
        const meta = book.package.metadata;
        console.log({ meta });
        const entity = {
          id: file,
          title: meta.title,
          author: meta.creator,
          publisher: meta.publisher,
          path: file,
        };
        this.$db.insert(entity);

        entity.title =
          entity.title.length > 35
            ? `${entity.title.substring(0, 35)}...`
            : entity.title;
        this.bookList.push(entity);
      });
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
  border: 1px solid #d7dae2;
  background-color: #ffffff;
  border-radius: 15px;
  height: -webkit-fill-available;
}

ul {
  list-style: none;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

li {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 25px;
  min-width: 170px;
  flex-grow: 1;
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
  /* float: left; */
  left: 50%;
  right: 50%;
}

#right {
  right: 10px;
  float: right;
  -webkit-app-region: no-drag !important;
}
</style>
