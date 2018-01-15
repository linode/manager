const path = require('path');
const process = require('process');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const _package = require('./package.json');

module.exports = {
  context: __dirname,
  node: {
    __filename: true,
  },
  devtool: 'source-map',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    'webpack-hot-middleware/client',
    './src/index',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/static/',
  },
  plugins: [
    /**
     * Tool used to generate the FoamTree bundle view.
     */
    new BundleAnalyzerPlugin(),

    /**
     * Split /node_modules/ into their own bundle.
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource),
    }),
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
                path.resolve(__dirname, './node_modules/linode-components/scss/'),
              ],
            },
          },
        ],
      },
      {
        test: /\.jsx?/,
        use: ['babel-loader'],
        include: [
          path.join(__dirname, 'src'),
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
    extensions: ['.js', '.jsx'],
  },
};
