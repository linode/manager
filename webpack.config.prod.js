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
      'NODE_ENV': 'production'
    },
    'ENV_DEVTOOLS_DISABLED': process.env.DEVTOOLS_DISABLED,
    'ENV_CONSOLE_TRACE_ENABLED': process.env.CONSOLE_TRACE_ENABLED,
    'ENV_API_ROOT': process.env.API_ROOT,
    'ENV_LOGIN_ROOT': process.env.LOGIN_ROOT,
    'ENV_APP_ROOT': process.env.APP_ROOT,
    'ENV_GA_ID': process.env.GA_ID,
    'ENV_VERSION': _package.version
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
