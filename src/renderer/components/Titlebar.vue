<template>
  <el-header height="40px" :class="{backdrop:backdrop}">
    <span id="left">
      <el-button v-if="add" size="small" icon="el-icon-plus" circle @click="onAdd"/>

      <el-button-group>
        <el-button v-if="back" size="small" icon="el-icon-back" circle @click="onBack"/>
        <el-button v-if="library" size="small" icon="el-icon-s-grid" circle @click="onLibrary"/>
      </el-button-group>

      <el-popover v-if="menu" popper-class="popper" placement="bottom" width="350" trigger="hover">
        <div class="el-popover__title">Table of Content</div>
        <el-button slot="reference" size="small" icon="el-icon-reading" circle/>
        <el-tree :data="toc" @node-click="onNodeClick"/>
      </el-popover>

      <el-popover
        v-if="bookmark"
        popper-class="popper"
        placement="bottom"
        width="350"
        trigger="hover"
      >
        <div class="el-popover__title">
          Bookmarks
          <el-button size="mini" icon="el-icon-plus" circle @click="onAddBookmark"/>
        </div>
        <el-button v-if="menu" slot="reference" size="small" icon="el-icon-collection-tag" circle/>
        <el-tree :data="bookmarks" node-key="id" @node-click="onNodeClick">
          <span slot-scope="{ node }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="text" icon="el-icon-close" @click="() => onRemoveBookmark(node)"/>
            </span>
          </span>
        </el-tree>
      </el-popover>

      <!-- search in book for words -->
      <el-popover
        v-if="search"
        popper-class="popper"
        placement="bottom"
        width="350"
        trigger="hover"
        @show="startSearch"
        @hide="stopSearch"
      >
        <el-button slot="reference" size="small" icon="el-icon-search" circle/>
        <div class="el-popover__title">
          <el-input
            v-model="searchText"
            size="small"
            width="300"
            placeholder="search"
            @change="onSearchTextChange"
          />
        </div>
        <el-table height="95%" :show-header="false" :data="searchResult" @cell-click="onNodeClick">
          <el-table-column prop="label" width="350"></el-table-column>
        </el-table>
      </el-popover>
    </span>

    <span id="center">{{ title }}</span>

    <span id="right">
      <el-button size="small" icon="el-icon-minus" circle @click="minimizeWindow"/>
      <el-button size="small" icon="el-icon-full-screen" circle @click="maximizeWindow"/>
      <el-button size="small" icon="el-icon-close" circle @click="closeWindow"/>
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
    bookmark: {
      default: false,
      type: Boolean,
    },
    backdrop: {
      default: false,
      type: Boolean,
    },
    title: {
      default: 'Eplee',
      type: String,
    },
    toc: {
      default: () => {},
      type: Array,
    },
    bookmarks: {
      default: () => {},
      type: Array,
    },
    searchResult: {
      default: () => {},
      type: Array,
    },
  },
  data() {
    return {
      searchText: '',
    };
  },
  watch: {
    searchResult() {
      this.startSearch();
    },
  },
  mounted() {
    this.$bind(
      this.$electron.remote.getCurrentWindow(),
      'CommandOrControl+O',
      this.onAdd
    );
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
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    },
    onAdd() {
      this.$bus.emit('add-button');
    },
    onSearchTextChange() {
      if (this.searchText.length === 0) {
        return;
      }
      this.$bus.emit('search-input', this.searchText);
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
    onBack() {
      this.$bus.emit('back-button');
    },
    onLibrary() {
      this.$router.push('/');
      this.$bus.emit('library-button');
    },
    onMenu() {
      this.$bus.emit('menu-button');
    },
    onAddBookmark() {
      this.$bus.emit('add-bookmark-button');
    },
    onRemoveBookmark(bookmark) {
      this.$bus.emit('remove-bookmark-button', bookmark);
    },
    onNodeClick(item) {
      this.$bus.emit('toc-item-clicked', item.cfi || item.href);
    },
  },
};
</script>

<style lang="less" scoped>
@import '../assets/style';

.el-header {
  text-align: center;
  vertical-align: middle;
  padding: @padding;
  -webkit-app-region: drag !important;
  -webkit-user-select: none;
  -webkit-font-smoothing: antialiased;
}
.backdrop {
  backdrop-filter: blur(40px);
}
.el-button {
  margin-left: @margin;
  background: #fff0;
}

#left {
  float: left;
  -webkit-app-region: no-drag !important;
  vertical-align: sub;
}

#left .el-button:first-of-type {
  margin-left: 0px;
}

#center {
  left: 50%;
  right: 50%;
  vertical-align: sub;
  font-size: 16px;
  color: #333;
}

#right {
  float: right;
  -webkit-app-region: no-drag !important;
  vertical-align: sub;
}

.el-input {
  width: 100%;
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
[class*=' el-icon-'],
[class^='el-icon-'] {
  height: 11px;
  width: 12px;
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

.el-table__row {
  user-select: none;
  cursor: pointer;
}
</style>
