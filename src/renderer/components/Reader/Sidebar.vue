<template>
  <el-tabs stretch value="toc">
    <el-tab-pane label="toc" name="toc" >
      <span slot="label"><i class="el-icon-notebook-2"></i></span>
      <el-tree :data="toc" @node-click="tocNodeClick"></el-tree>
    </el-tab-pane>
    <el-tab-pane label="Bookmarks" name="bookmarks">
      <span slot="label"><i class="el-icon-collection-tag"></i></span>
    </el-tab-pane>
    <el-tab-pane label="Info" name="info">
      <span slot="label"><i class="el-icon-warning-outline"></i></span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  name:'Sidebar',
  props:{
    toc:{
      default:[],
      type: Array,
    }
  },
  methods:{
    tocNodeClick(data) {
        // console.log(data);
    }
  }
};
</script>

<style scoped>

.el-tabs {
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
  border-right: 1px solid #d7dae2;
  width: 350px;
  height: 600px;

  flex-shrink: 0;
  top: 0px;
  right: 0px;
  z-index: 4;
  position: relative;
  user-select: none;
}

</style>
