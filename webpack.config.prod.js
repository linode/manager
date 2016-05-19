var path = require('path');
var webpack = require('webpack');
var _ = require('./webpack.config.dev.js');

_.entry = './src/index';
_.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  })
];

module.exports = _;;
