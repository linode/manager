var webpack = require("karma-webpack");
var path = require("path");

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['Phantomjs', 'Chrome', 'Firefox'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.spec.js',
      'test/setup.js'
    ],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['webpack', 'sourcemap'],
      'test/setup.js': ['webpack', 'sourcemap']
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
      },
      externals: {
        'cheerio': 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
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
      require("karma-firefox-launcher"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-coverage")
    ],
    browserNoActivityTimeout: 100000
  });

  if (process.env.TRAVIS) {
    config.browsers = ['Firefox'];
  }    
};
