/**
 * webpack基础配置
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require("webpack");

const config = {
  entry: {
    index: ['./src/index.js']
  },
  module: {
    rules: [
      {
        test: /(?:\.js|\.jsx|\.es6)$/,
        loader: 'babel-loader',
        options: {
          plugins: [
            ["import", {
              "libraryName": "antd",
              "libraryDirectory": "es",
              "style": "css" // `style: true` 会加载 less 文件
            }]
          ]
        },
        exclude: /node_modules/,
        include: [path.join(process.cwd(), './src')]
      },
      // 编译css
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        include: [path.join(process.cwd(), './src')],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      //编译加载图片及字体
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000,
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.es6', '.less', '.css']
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'index-[hash:8].js',
    chunkFilename: 'js/[name].chunk-[chunkhash:8].js',
  },

  plugins: [
    new webpack.IgnorePlugin(/\.\/local/, /moment/),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: "dependency"
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[contenthash:8].css',
      chunkFilename: 'css/[id]-[contenthash:8].css'
    })
  ],

};

module.exports = config;
