<template>
  <el-tabs
    stretch
    value="toc"
  >
    <el-tab-pane
      label="toc"
      name="toc"
    >
      <span slot="label"><i class="el-icon-notebook-2" /></span>
      <el-tree
        :data="toc"
        @node-click="tocNodeClick"
      />
    </el-tab-pane>
    <el-tab-pane
      label="Bookmarks"
      name="bookmarks"
    >
      <span slot="label"><i class="el-icon-collection-tag" /></span>
    </el-tab-pane>
    <el-tab-pane
      label="Info"
      name="info"
    >
      <span slot="label"><i class="el-icon-warning-outline" /></span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  name:'Sidebar',
  props:{
    toc:{
      default:()=>[],
      type: Array,
    }
  },
  methods:{
    tocNodeClick(item) {
        console.log(item);
        this.$bus.emit('toc-item-clicked', item.herf);
    }
  }
};
</script>

<style scoped>

.el-tabs {
  border-right: 1px solid #d7dae2;
  border-top: 1px solid #d7dae2;
  border-bottom: 1px solid #d7dae2;
  flex-shrink: 0;
  top: 0px;
  right: 0px;
  z-index: 4;
  height: 100%;
  width: 350px;
  position: relative;
  user-select: none;
}

.el-tab-pane{
  height: 100%;
}

.el-tabs__content{
  height: 100% !important;
}

.el-tabs__header{
  margin: 0px !important;
}

.el-tree{
  height: 100%;
  overflow-y: scroll;
}

::-webkit-scrollbar {
  display: none;
}
</style>
