var _ = require('./webpack.config.dev');
var externals = require('webpack-node-externals');
var path = require('path');

module.exports = {
  externals: externals(),
  module: _.module,
  sassLoader: _.sassLoader,
  target: 'node',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
};
