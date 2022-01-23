/**
 * 生产环境配置
 */
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const getEnvDefine = require('./envDefine');
const optimization = require('./webpack.optimization')

const envName = 'production';

process.env.NODE_ENV = 'production';

const envDefine = getEnvDefine(envName);

const config = {
  ...baseConfig,
  optimization: optimization(envName),
  mode: envName === 'development' ? 'development' : 'production',
};

config.plugins.push(new webpack.DefinePlugin(envDefine));

module.exports = config;
