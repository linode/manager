var webpack = require("karma-webpack");
var path = require("path");

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['PhantomJS'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.spec.js',
      'test/setup.js'
    ],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['webpack', 'sourcemap'],
      'test/setup.js': ['webpack']
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.jsx?/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            include: [
              path.join(__dirname, 'src'),
              path.join(__dirname, 'test')
            ]
          },
          {
            test: /\.scss$/,
            loaders: ["style", "css", "sass"]
          },
          {
            test: /\.jsx?/,
            include: path.join(__dirname, 'src'),
            loader: 'isparta'
          }
        ]
      },
      sassLoader: {
        includePaths: [path.resolve(__dirname, "./node_modules/bootstrap/scss/")]
      }
    },
    webpackMiddleware: {
      stats: {
        colors: true
      },
      noInfo: true
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage',
      subdir: '.'
    },
    plugins: [
      webpack,
      require("karma-mocha"),
      require("karma-spec-reporter"),
      require("karma-chrome-launcher"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-coverage")
    ]
  });
};
