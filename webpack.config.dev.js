var path = require('path');
var process = require('process');
var webpack = require('webpack');

var _package = require('./package.json');

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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      'ENV_DEVTOOLS_DISABLED': JSON.stringify(process.env.DEVTOOLS_DISABLED),
      'ENV_API_ROOT': JSON.stringify(process.env.API_ROOT),
      'ENV_LOGIN_ROOT': JSON.stringify(process.env.LOGIN_ROOT),
      'ENV_APP_ROOT': JSON.stringify(process.env.APP_ROOT),
      'ENV_GA_ID': JSON.stringify(process.env.GA_ID),
      'ENV_SENTRY_URL': JSON.stringify(process.env.SENTRY_URL),
      'ENV_VERSION': JSON.stringify(_package.version),
      'ENV_LONGVIEW_ROOT': JSON.stringify(process.env.LONGVIEW_ROOT),
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
          path.resolve(__dirname, './components'),
          path.resolve(__dirname, './node_modules/linode-styleguide')
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
        use: ['file-loader'],
        include: path.join(__dirname, 'node_modules')
      }
    ]
  },
  resolve: {
    alias: {
      'react': path.join(__dirname, 'node_modules', 'react')
    }
  }
};
