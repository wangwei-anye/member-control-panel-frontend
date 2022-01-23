const fs = require('fs-extra');
const path = require('path');
const rootPath = path.resolve(__dirname, '../');

const cachePath = path.resolve(rootPath, '.cache');
const dist = path.resolve(rootPath, 'dist');
const staticInput = path.resolve(rootPath, 'public');
const staticOutput = path.resolve(rootPath, 'dist/static');
const authHtml = path.resolve(rootPath, 'auth.html');

fs.emptyDirSync(dist); // clean cache
fs.ensureDirSync(staticInput);
fs.ensureDirSync(staticOutput);
const p1 = fs.copy(staticInput, staticOutput); // copy static files
const p2 = fs.copy(path.resolve(rootPath, 'auth.html'), `${dist}/auth.html`); // copy auth.html
const p3 = fs.copy(path.resolve(rootPath, 'robots.txt'), `${dist}/robots.txt`); // copy robots.txt

Promise.all([p1, p2, p3])
  .then(() => console.log('Everything is ready! Begin build...'))
  .catch((err) => console.error(err));
