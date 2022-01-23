/**
 * 测试环境配置
 */
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const getEnvDefine = require('./envDefine');
const optimization = require('./webpack.optimization');

const envName = 'dadi';

process.env.NODE_ENV = 'production'; // 测试环境保持和生产环境一致的环境变量

const envDefine = getEnvDefine(envName);

const config = {
  ...baseConfig,
  mode: 'production',
  optimization: optimization(envName),
};

config.plugins.push(new webpack.DefinePlugin(envDefine));

module.exports = config;
