const { fork } = require('child_process');
const Bundler = require('parcel-bundler');
const opn = require('opn');
const setEnv = require('./env');
const jrConfig = require('./jrconfig');

const proc = fork(require.resolve('./justreqServer'));

// parcel-bundler配置
const options = {
  port: jrConfig.port,
  cache: true,
  hmr: true,
  https: false,
};

setEnv('development');

proc.once('exit', code => {
  process.exit(code);
});

process.once('exit', () => {
  proc.kill();
});

opn('http://127.0.0.1:' + jrConfig.jrPort);

const bundler = new Bundler('index.html', options);
bundler.serve(options.port, options.https);
