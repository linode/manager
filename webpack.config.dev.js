const path = require('path');
const process = require('process');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const _package = require('./package.json');

function srcPath(subdir) {
  return subdir
    ? path.join(__dirname, 'src', subdir)
    : path.join(__dirname, 'src');
}

module.exports = {
  context: __dirname,
  node: {
    __filename: true,
  },
  devtool: 'source-map',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    srcPath('index.js'),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: srcPath('index.html'),
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
    }),

    new webpack.NamedModulesPlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      ENV_DEVTOOLS_DISABLED: JSON.stringify(process.env.DEVTOOLS_DISABLED),
      ENV_API_ROOT: JSON.stringify(process.env.API_ROOT),
      ENV_LOGIN_ROOT: JSON.stringify(process.env.LOGIN_ROOT),
      ENV_LISH_ROOT: JSON.stringify(process.env.LISH_ROOT),
      ENV_APP_ROOT: JSON.stringify(process.env.APP_ROOT),
      ENV_GA_ID: JSON.stringify(process.env.GA_ID),
      ENV_SENTRY_URL: JSON.stringify(process.env.SENTRY_URL),
      ENV_VERSION: JSON.stringify(_package.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.md$/,
        use: ['ignore-loader'],
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.resolve(__dirname, './node_modules/bootstrap/scss/'),
              ],
            },
          },
        ],
      },
      {
        test: /\.tsx?/,
        use: [require.resolve('babel-loader'), require.resolve('ts-loader')],
        include: [
          srcPath(),
        ],
      },
      {
        test: /\.jsx?/,
        loader: require.resolve('babel-loader'),
        include: [
          srcPath(),
          path.resolve(__dirname, 'node_modules/react-vnc-display'),
        ],
      },
      {
        test: /\.svg$/,
        use: ['file-loader'],
        include: path.join(__dirname, 'node_modules'),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': srcPath(),
    },
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
