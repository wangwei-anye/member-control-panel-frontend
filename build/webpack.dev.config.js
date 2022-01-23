/**
 * 开发环境webpack配置
 */
const webpack = require('webpack');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const baseConfig = require('./webpack.base.config');
const getEnvDefine = require('./envDefine');
const optimization = require('./webpack.optimization')

const envName = 'development';

const envDefine = getEnvDefine(envName);

const env = envDefine['process.env.NODE_ENV']

const config = {
  ...baseConfig,
  optimization: optimization(envName),
  mode: env === 'production' ? 'production' : 'development',
};

config.plugins.push(new webpack.DefinePlugin(envDefine));

// 只是在开发环境中使用这个插件进行 bundle 分析
// config.plugins.push(new BundleAnalyzerPlugin())

config.devtool = 'cheap-module-source-map'; // 慢速，查错时用

module.exports = config;
