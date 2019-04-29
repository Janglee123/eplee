<template>
  <div class="sidebar">
    <el-tabs
      stretch
      value="toc"
    >
      <el-tab-pane
        label="toc"
        name="toc"
      >
        <span slot="label">
          <i class="el-icon-notebook-2" />
        </span>
        <el-tree
          :data="toc"
          @node-click="tocNodeClick"
        />
      </el-tab-pane>
      <el-tab-pane
        label="Bookmarks"
        name="bookmarks"
      >
        <span slot="label">
          <i class="el-icon-collection-tag" />
        </span>
      </el-tab-pane>
      <el-tab-pane
        label="Info"
        name="info"
      >
        <span slot="label">
          <i class="el-icon-warning-outline" />
        </span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    toc: {
      default: () => [],
      type: Array,
    },
  },
  methods: {
    tocNodeClick(item) {
      console.log(item);
      this.$bus.emit('toc-item-clicked', item.herf);
    },
  },
};
</script>

<style scoped>
.sidebar {
  border: 1px solid #d7dae2;
  position: absolute;
  top: 45px;
  bottom: 45px;
  z-index: 4;
  width: 350px;
  user-select: none;
}

.el-tabs {
  /* border-top: 1px solid #d7dae2; */
  /* border-bottom: 1px solid #d7dae2; */
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-tab-pane {
  height: 100%;
  bottom: 45px;
}

.el-tabs__content {
  flex: 1;
  height: 100%;
}

.el-tree {
  max-height: 100%;
  overflow: auto;
}

::-webkit-scrollbar {
  display: none;
}
</style>
