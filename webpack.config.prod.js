const path = require('path');
const webpack = require('webpack');
const _ = require('./webpack.config.dev.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const parts = require('./config/webpack.parts');
const paths = require('./config/paths');

const cssFilename = '[name].[contenthash:8].css';
_.entry = './src/index';
_.plugins = [

  new ExtractTextPlugin({
    filename: cssFilename,
  }),

  new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  }),

  parts.manifest,

  parts.ignoreMomentLocales,

  new webpack.HashedModuleIdsPlugin(),

  parts.envVariables('production'),

  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: {
      warnings: false,
    },
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
];

_.module = {
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
          loader: ExtractTextPlugin.extract({
            fallback: {
              loader: require.resolve('style-loader'),
              options: {
                hmr: false,
              },
            },
            use: [
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  minimize: true,
                  sourceMap: false,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: 'postcss',
                  plugins: () => [
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
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
};

module.exports = _;
