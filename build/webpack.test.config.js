/**
 * 测试环境配置
 */
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const getEnvDefine = require('./envDefine');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const optimization = require('./webpack.optimization')

const envName = 'testing';

process.env.NODE_ENV = 'production'; // 测试环境保持和生产环境一致的环境变量

const envDefine = getEnvDefine(envName);

const plugins = [
  new HtmlWebpackPlugin({ template: './index.html' }),
  new MiniCssExtractPlugin({
    filename: 'css/[name]-[contenthash:8].css',
    chunkFilename: 'css/[id]-[contenthash:8].css',
  }),
];

const config = {
  ...baseConfig,
  mode: envName === 'development' ? 'development' : 'production',
  optimization: optimization(envName),
  plugins,
};

config.plugins.push(new webpack.DefinePlugin(envDefine));

module.exports = config;
