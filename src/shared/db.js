import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';

// use appData path insted of userData path
// https://discuss.atom.io/t/app-getpath-userdata-seems-to-give-the-wrong-path/26006
const appData = remote.app.getPath('appData');

const db = {
  dbPath: '',
  new(name) {
    this.dbPath = path.join(appData, 'eplee', `${name}.json`);

    if (fs.existsSync(this.dbPath)) {
      console.log(`${this.dbPath} found`);
      const rawfile = fs.readFileSync(this.dbPath);
      this.db = JSON.parse(rawfile);
    } else {
      console.log(`${this.dbPath}.json not found`);

      this.db = {};
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db));
      console.log(`${this.dbPath}.json created`);
    }
  },

  syncDb() {
    // hack to wait untile wait for insert queue
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      const str = JSON.stringify(this.db);
      fs.writeFileSync(this.dbPath, str);
    }, 500);
  },

  insert(entity) {
    const id = entity.id.toString();
    this.db[id] = entity;
    this.syncDb();
  },

  remove(entity) {
    delete this.db[entity.id.toString()];
    this.syncDb();
  },

  getList() {
    return Object.values(this.db);
  },
};

export default db;
