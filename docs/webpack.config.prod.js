var path = require('path');
var process = require('process');
var webpack = require('webpack');
var _ = require('./webpack.config.dev.js');
var _package = require('./package.json');

_.devtool = 'cheap-module-source-map';
_.entry = './src/index';
_.plugins = [
  new webpack.optimize.CommonsChunkPlugin('common.js'),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    },
    'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
    'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
    'ENV_API_VERSION': JSON.stringify(process.env.API_VERSION),
    'ENV_GA_ID': JSON.stringify(process.env.GA_ID),
    'ENV_VERSION': JSON.stringify(_package.version)
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.AggressiveMergingPlugin()
];

module.exports = _;
