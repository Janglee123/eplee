<template>
	<router-view/>
</template>

<script>
import path from 'path';
import fs from 'fs';
import fileUrl from 'file-url';
import { storeCover, getInfo } from '../shared/dbUtilis.js';

export default {
  name: 'App',
  data() {
    return {
      arg: [],
    };
  },

  mounted() {
    // check last argv has path to epub or not
    const arg = process.argv[process.argv.length - 1];

    if (arg.endsWith('.epub') && fs.existsSync(arg)) {
      // if epubfile is passed in args open file and redirect to reader
      console.log('file found', arg);

      const file = arg;

      // if file is opend first time store it in db 
      getInfo(file, (info, book) => {
        const key = info.id;
        
        this.$router.push({ name: 'Reader', params: { id:key } });
        
        if (this.$db.has(key)) {
            return;
        }

        const coverPath = path.join(this.$dataPath, 'cover', key);
        info.coverPath = fileUrl(coverPath);

        storeCover(book, coverPath, () => {
          try {
            this.$db.insert(key, info);
          } catch (err) {
            console.log(err);
          }
        });
      });
    }
      
    this.$bind(
      this.$electron.remote.getCurrentWindow(),
      'CommandOrControl+Shift+I',
      () => {
        this.$electron.remote.getCurrentWindow().toggleDevTools();
      }
    );
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
