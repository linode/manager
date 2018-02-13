const path = require('path');
const process = require('process');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const parts = require('./config/webpack.parts');

module.exports = {
  context: __dirname,
  node: {
    __filename: true,
  },
  devtool: 'source-map',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    './src/index',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    publicPath: '/',
  },
  plugins: [
    new ExtractTextPlugin('[name]-[hash].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),

    parts.asyncChunkByModuleName('chart.js'),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
    }),

    parts.ignoreMomentLocales,

    new webpack.NamedModulesPlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    parts.envVariables(process.env.NODE_ENV),

  ],
  module: {
    rules: [
      {
        oneOf: [
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
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                'css-loader',
                {
                  loader: 'postcss-loader', // Run post css actions
                  options: {
                    plugins: () => [
                      require('precss'),
                      autoprefixer(),
                    ],
                  },
                },
                {
                  loader: 'sass-loader',
                  options: {
                    includePaths: [
                      path.resolve(__dirname, './node_modules/bootstrap/scss/'),
                    ],
                  },
                },
              ],
            }),
          },
          {
            test: /\.jsx?/,
            loader: require.resolve('babel-loader'),
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'node_modules/react-vnc-display'),
            ],
          },
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            use: ['file-loader'],
            include: path.join(__dirname, 'node_modules'),
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
