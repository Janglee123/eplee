<template>
  <el-header
    height="45px"
    :class="{shadow:shadow}"
  >
    <span id="left">
      <el-button
        v-if="add"
        size="small"
        icon="el-icon-plus"
        circle
        @click="onAdd"
      />

      <el-input
        v-if="search"
        v-model="searchText"
        style="width:200px; margin-left:5px;"
        prefix-icon="el-icon-search"
        size="small"
        placeholder="Search"
        clearable
      />

      <el-button
        v-if="back"
        size="small"
        icon="el-icon-back"
        circle
        @click="onBack"
      />
      <el-button
        v-if="library"
        size="small"
        icon="el-icon-s-grid"
        circle
        @click="onLibrary"
      />
      <el-button
        v-if="menu"
        size="small"
        icon="el-icon-more"
        circle
        @click="onMenu"
      />
    </span>
    <span id="center">{{ title }}</span>
    <span id="right">
      <el-button
        size="small"
        icon="el-icon-minus"
        circle
        @click="minimizeWindow"
      />
      <el-button
        size="small"
        icon="el-icon-full-screen"
        circle
        @click="maximizeWindow"
      />
      <el-button
        size="small"
        icon="el-icon-close"
        circle
        @click="closeWindow"
      />
    </span>
  </el-header>
</template>

<script>
export default {
  name: 'Titlebar',
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
  mounted(){
    // this.$mousetrap.bind(['command+o', 'ctrl+o'], this.onAdd);
    // this.$mousetrap.bind(['command+x', 'ctrl+x'], this.onAdd);
    // console.log(this.$bind)
    this.$bind(this.$electron.remote.getCurrentWindow(),'CommandOrControl+O', this.onAdd);
  },
  methods: {
    closeWindow() {
      this.$electron.remote.getCurrentWindow().close();
    },
    minimizeWindow() {
      this.$electron.remote.getCurrentWindow().minimize();
    },
    maximizeWindow() {
      const win = this.$electron.remote.getCurrentWindow();
      if(win.isMaximized()){
        win.unmaximize() 
      } 
      else{
        win.maximize();
      }
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
};
</script>

<style scoped>
.el-header {
  background-color: #ffffff;
  color: #333;
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
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

