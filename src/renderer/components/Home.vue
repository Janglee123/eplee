<template>
  <el-container direction='vertical'>
    <titlebar add search shadow></titlebar>
    <el-main>
      <ul>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
        <li>
          <card/>
        </li>
      </ul>
    </el-main>
  </el-container>
</template>

<script>
import Card from './Home/Card';
import Titlebar from './Titlebar'
export default {
  name: 'Home',
  components: {
    Card,
    Titlebar,
  },
  mounted(){
    this.$bus.on('add-button',()=>{
      console.log('got it');
    });
  },
  methods: {
    addFiles() {
      let files = this.$electron.remote.dialog.showOpenDialog({
        filters: [{ name: 'ePub', extensions: ['epub'] }],
        properties: ['openFile', 'multiSelections'],
      });
      if (!files) {
        return;
      }
      console.log(files);
      // addToDB();
    },
  },
  data() {
    return {
    };
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
  border:1px solid #d7dae2;
  background-color: #ffffff;
  border-radius: 15px;
  height: -webkit-fill-available;
}

.el-input {
  border-radius: 30px;
}

.el-header {
  background-color: #ffffff;
  color: #333;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  /* border-bottom: 1px solid #d7dae2; */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) ;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 50px;
  z-index: 2;
  -webkit-app-region: drag !important;
  -webkit-user-select: none;
}

ul {
  list-style: none;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

li {
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 25px;
  width: 170px;
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

::-webkit-scrollbar {
  display: none;
}
</style>
