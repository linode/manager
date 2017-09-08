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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
      'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
      'ENV_API_VERSION': JSON.stringify(process.env.API_VERSION),
      'ENV_GA_ID': JSON.stringify(process.env.GA_ID),
      'ENV_VERSION': JSON.stringify(_package.version)
    })
  ],
  module: {
    rules: [
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
      {
        test: /\.jsx?/,
        use: ['babel-loader'],
        include: [
          path.join(__dirname, 'src'),
          path.resolve(__dirname, './node_modules/linode-components'),
          path.resolve(__dirname, '../components'),
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.resolve(__dirname, './node_modules/bootstrap/scss/')
              ]
            }
          }
        ],
      },
      {
        test: /\.svg$/,
        loader: ['file-loader'],
        include: path.join(__dirname, 'node_modules')
      }
    ]
  }
};
