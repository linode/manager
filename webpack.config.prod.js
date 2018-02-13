const webpack = require('webpack');
const _ = require('./webpack.config.dev.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const parts = require('./config/webpack.parts');

_.entry = './src/index';
_.plugins = [
  /** Will not work if ExtractTextPlugin is removed from module.ruls */
  new ExtractTextPlugin('[name]-[hash].css'),
  new HtmlWebpackPlugin({
    template: 'src/index.html',
  }),

  parts.asyncChunkByModuleName('chart.js'),

  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
  }),

  parts.ignoreMomentLocales,

  new webpack.HashedModuleIdsPlugin(),

  parts.envVariables('production'),

  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: {
      warnings: false,
    },
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
];

module.exports = _;
