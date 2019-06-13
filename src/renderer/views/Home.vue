<template>
	<el-container direction="vertical">
		<titlebar backdrop shadow>
			<el-button size="small" icon="el-icon-plus" circle @click="addFiles" />
		</titlebar>
		<el-main>
			<grid class="grid" :book-list="bookList" />
		</el-main>
	</el-container>
</template>

<script>
import Grid from '../components/Home/Grid';
import Titlebar from '../components/Titlebar';
import { addToDB } from '../../shared/dbUtilis.js';

export default {
  name: 'Home',
  components: {
    Titlebar,
    Grid,
  },
  data() {
    return {
      bookList: [],
    };
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
    addFiles() {
      const files = this.$electron.remote.dialog.showOpenDialog({
        filters: [{ name: 'ePub', extensions: ['epub'] }],
        properties: ['openFile', 'multiSelections'],
      });
      if (files) {
        files.forEach(file => {
          addToDB(file, this.$db, (info)=>{
            this.bookList.unshift(info);
          });
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/style';

.grid{
  margin: 40px;
}

</style>
