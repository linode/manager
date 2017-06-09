var path = require('path');
var process = require('process');
var webpack = require('webpack');

var _package = require('./package.json');

module.exports = {
  context: __dirname,
  node: {
    __filename: true,
  },
  devtool: 'module-eval-source-map',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    'webpack-hot-middleware/client',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': process.env.NODE_ENV
      },
      'ENV_API_ROOT': process.env.API_ROOT,
      'ENV_LOGIN_ROOT': process.env.LOGIN_ROOT,
      'ENV_API_VERSION': process.env.API_VERSION,
      'ENV_GA_ID': process.env.GA_ID,
      'ENV_VERSION': _package.version
    })
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loaders: ['json-loader'],
      },
      {
        test: /\.jsx?/,
        loaders: ['babel'],
        include: [
          path.join(__dirname, 'src'),
          path.resolve(__dirname, './node_modules/linode-components'),
        ]
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test: /\.svg$/,
        loaders: ['file'],
        include: path.join(__dirname, 'node_modules')
      }
    ]
  },
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, './node_modules/bootstrap/scss/'),
    ]
  }
};
