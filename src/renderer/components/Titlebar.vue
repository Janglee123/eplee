<template>
	<el-header height="40px" :class="{backdrop:backdrop}">
		<span id="left">
			<slot></slot>
		</span>
		<span id="center">{{ title }}</span>

		<span id="right">
			<el-button size="small" icon="el-icon-minus" circle @click="minimizeWindow" />
			<el-button size="small" icon="el-icon-full-screen" circle @click="maximizeWindow" />
			<el-button size="small" icon="el-icon-close" circle @click="closeWindow" />
		</span>
	</el-header>
</template>

<script>
export default {
  name: 'Titlebar',
  props: {
    backdrop: {
      default: false,
      type: Boolean,
    },
    title: {
      default: 'Eplee',
      type: String,
    },
  },
  methods: {
    closeWindow() {
      this.$remote.getCurrentWindow().close();
    },
    minimizeWindow() {
      this.$remote.getCurrentWindow().minimize();
    },
    maximizeWindow() {
      const win = this.$remote.getCurrentWindow();
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
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

</style>

<style>
[class*=' el-icon-'],
[class^='el-icon-'] {
  height: 11px;
  width: 12px;
}
</style>
