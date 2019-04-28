<template>
  <el-header height="45px" v-bind:class="{shadow:shadow}">
    <span id="left">
      <el-button v-if="add" size="small" icon="el-icon-plus" circle v-on:click="onAdd"></el-button>

      <el-input
        v-if="search"
        style="width:200px; margin-left:5px;"
        prefix-icon="el-icon-search"
        size="small"
        placeholder="Search"
        clearable
        v-model="searchText"
      ></el-input>

      <el-button v-if="back" size="small" icon="el-icon-back" circle v-on:click="onBack"></el-button>
      <el-button v-if="library" size="small" icon="el-icon-s-grid" circle v-on:click="onLibrary"></el-button>
      <el-button v-if="menu" size="small" icon="el-icon-more" circle v-on:click="onMenu"></el-button>
    </span>
    <span id="center">{{ title }}</span>
    <span id="right">
      <el-button size="small" icon="el-icon-minus" v-on:click="minimizeWindow" circle></el-button>
      <el-button size="small" icon="el-icon-full-screen" circle v-on:click="maximizeWindow"></el-button>
      <el-button size="small" icon="el-icon-close" circle v-on:click="closeWindow"></el-button>
    </span>
  </el-header>
</template>

<script>
import { type } from 'os';
import { Stream } from 'stream';
export default {
  name: 'Titlebar',
  methods: {
    closeWindow() {
      this.$electron.remote.getCurrentWindow().close();
    },
    minimizeWindow() {
      this.$electron.remote.getCurrentWindow().minimize();
    },
    maximizeWindow() {
      let win = this.$electron.remote.getCurrentWindow();
      win.isMaximized() ? win.unmaximize() : win.maximize();
    },
    onAdd(){
      this.$bus.emit('add-button');
    },
    onSearchTextChange(){
      this.$bus.emit('search-input');
    },
    onBack(){
      this.$bus.emit('back-button');
    },
    onLibrary(){
      this.$bus.emit('library-button');
    },
    onMenu(){
      this.$bus.emit('menu-button');
    }
  },
  props: {
    shadow: {
      default: false,
      type: Boolean,
    },
    add: {
      default: false,
      type: Boolean,
    },
    search: {
      default: false,
      type: Boolean,
    },
    back: {
      default: false,
      type: Boolean,
    },
    library: {
      default: false,
      type: Boolean,
    },
    menu: {
      default: false,
      type: Boolean,
    },
    title:{
      default: 'Eplee',
      type: String,
    }
  },
  data() {
    return {
      searchText: '',
    };
  },
};
</script>

<style scoped>
.el-header {
  background-color: #ffffff;
  color: #333;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  /* border-bottom: 1px solid #d7dae2; */
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 50px;
  z-index: 2;
  -webkit-app-region: drag !important;
  -webkit-user-select: none;
}

.shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

