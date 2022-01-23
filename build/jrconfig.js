const fs = require('fs-extra');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

const rootPath = path.resolve(__dirname, '../');

// read config
const configFile = path.resolve(rootPath, '.justreq');
const configText = fs.readFileSync(configFile, 'utf-8');
const configs = JSON.parse(stripJsonComments(configText));

module.exports = configs;
