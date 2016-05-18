var webpack = require("karma-webpack");
var path = require("path");

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['PhantomJS'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.spec.js'
    ],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['webpack', 'sourcemap'],
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
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['spec'],
    plugins: [
      webpack,
      require("karma-mocha"),
      require("karma-spec-reporter"),
      require("karma-chrome-launcher"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader")
    ]
  });
};
