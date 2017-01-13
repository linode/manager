var path = require('path');
var process = require('process');
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  node: {
    __filename: true,
  },
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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      'ENV_DEVTOOLS_DISABLED': JSON.stringify(process.env.DEVTOOLS_DISABLED),
      'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
      'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
      'ENV_APP_ROOT': JSON.stringify(process.env.APP_ROOT),
      'ENV_GA_ID': JSON.stringify(process.env.GA_ID)
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loaders: ['babel-loader'],
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.svg$/,
        loaders: ['file-loader'],
        include: path.join(__dirname, 'node_modules')
      }
    ]
  }
};
