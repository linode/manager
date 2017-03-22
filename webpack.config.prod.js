var process = require('process');
var webpack = require('webpack');
var _ = require('./webpack.config.dev.js');
var _package = require('./package.json');

_.devtool = 'cheap-module-source-map';
_.entry = './src/index';
_.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),

    },
  }),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true
  }),
  new webpack.optimize.AggressiveMergingPlugin()
];

module.exports = _;
