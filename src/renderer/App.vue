<template>
	<div>
		<router-view v-loading="!isReady"/>
	</div>
</template>

<script>
import fs from 'fs';
import { addToDB } from '../shared/dbUtilis.js';

export default {
  name: 'App',
  data() {
    return {
      isReady: false,
    };
  },

  mounted() {
    // check last argv has path to epub or not
    const arg = process.argv[process.argv.length - 1];

    if (arg.endsWith('.epub') && fs.existsSync(arg)) {
      // if epub file is passed in args open file and redirect to reader
      const file = arg;

      addToDB(file, this.$db, (info)=>{
        this.isReady = true;
        this.$router.push({ name: 'Reader', params: { id: info.id } })
      });
    }
    else{
        this.isReady = true;
    }
  },
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}

html,
body {
  margin: 0px;
  width: 100%;
  height: 100%;
}
</style>
