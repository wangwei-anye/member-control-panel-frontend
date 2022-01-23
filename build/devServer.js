const { fork } = require('child_process');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const opn = require('opn');
const config = require('./webpack.dev.config.js');
const jrConfig = require('./jrconfig');

const proc = fork(require.resolve('./justreqServer'));

config.entry.index.unshift('webpack/hot/only-dev-server');
config.entry.index.unshift(`webpack-dev-server/client?http://localhost:${jrConfig.port}`); // 将热替换js内联进去
config.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(config);

const server = new webpackDevServer(compiler, {

  disableHostCheck: true,

  contentBase: './dist/',

  port: jrConfig.port,

  inline: true,

  hot: true,

  historyApiFallback:{
    index: 'index.html',
  },

  // noInfo: true,

  stats: {
    colors: true // 用颜色标识
  },

});

proc.once('exit', code => {
  process.exit(code);
});

process.once('exit', () => {
  proc.kill();
});

opn('http://127.0.0.1:' + jrConfig.jrPort);

server.listen(jrConfig.port);
