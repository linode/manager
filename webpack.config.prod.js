const webpack = require('webpack');
const _ = require('./webpack.config.dev.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const parts = require('./config/webpack.parts');
const paths = require('./config/paths');

_.entry = './src/index';
_.plugins = [
  /** Will not work if ExtractTextPlugin is removed from module.ruls */
  new ExtractTextPlugin('[name]-[hash].css'),

  new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
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
