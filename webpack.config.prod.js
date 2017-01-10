var path = require('path');
var process = require('process');
var webpack = require('webpack');
var _ = require('./webpack.config.dev.js');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

_.devtool = 'cheap-module-source-map';
_.entry = './src/index';
_.plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: 'common.js',
    minChunks: Infinity
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    },
    'ENV_DEVTOOLS_DISABLED': JSON.stringify(process.env.DEVTOOLS_DISBLED),
    'ENV_APP_ROOT': JSON.stringify(process.env.APP_ROOT),
    'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
    'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
    'ENV_GA_ID': JSON.stringify(process.env.GA_ID)
  }),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    compress: {
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
    },
    output: {
      comments: false
    },
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
    new ClosureCompilerPlugin({
    compiler: {
      language_in: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5',
      compilation_level: 'ADVANCED_OPTIMIZATIONS'
    },
    jsCompiler: true
  }),
];

module.exports = _;;
