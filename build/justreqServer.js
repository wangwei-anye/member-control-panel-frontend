const fs = require('fs-extra');
const Server = require('justreq');
const jrConfig = require('./jrconfig');

process.on('SIGINT', () => {
  process.exit(1);
});
//先清空 cache目录，否则会有十几个G的占用空间
const clearCache = fs.emptyDirSync(jrConfig.cachePath);
const p1 = fs.ensureDir(jrConfig.cachePath);
const p2 = fs.ensureDir(jrConfig.substitutePath);

Promise.all([clearCache, p1, p2])
  .then(() => new Server(jrConfig))
  .catch(err => console.error(err));
