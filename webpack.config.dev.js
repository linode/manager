var path = require('path');
var process = require('process');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
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
      'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
      'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
      'ENV_APP_ROOT': JSON.stringify(process.env.APP_ROOT)
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.svg$/,
        loaders: ['file'],
        include: path.join(__dirname, 'node_modules')
      }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, './node_modules/bootstrap/scss/')]
  }
};
