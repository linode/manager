var webpack = require("webpack");
var path = require("path");
var CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = function(config) {
  var files = process.env.npm_config_single_file ? process.env.npm_config_single_file : 'test/index.js';
  var option = {
    basePath: __dirname,
    frameworks: ['mocha'],
    browsers: ['PhantomJS'],
    webpack: {
      devtool: 'inline-source-map',
      entry: [
        './src/index'
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
              path.join(__dirname, 'test'),
              path.resolve(__dirname, 'node_modules/linode-components'),
              path.resolve(__dirname, 'components'),
              path.resolve(__dirname, 'node_modules/linode-styleguide')
            ]
          },
          {
            test: /\.scss$/,
            use: [
              "style-loader",
              "css-loader",
              {
                loader: "sass-loader",
                options: {
                  includePaths: [
                    path.resolve(__dirname, "./node_modules/bootstrap/scss/")
                  ]
                }
              }
            ]
          },
          {
            test: /\.svg$/,
            use: ['file-loader'],
            include: path.join(__dirname, 'node_modules')
          }
        ]
      },
      externals: {
        'cheerio': 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
          },
          ENV_DEVTOOLS_DISABLED: null,
          ENV_API_ROOT: null,
          ENV_LOGIN_ROOT: null,
          ENV_APP_ROOT: null,
          ENV_GA_ID: null,
          ENV_SENTRY_URL: null,
          ENV_VERSION: null,
        }),
        new CircularDependencyPlugin({
          failOnError: true,
          exclude: /node_modules/,
        })
      ]
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
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-spec-reporter"),
      require("karma-phantomjs-launcher"),
      require("karma-chrome-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-coverage")
    ],
    browserNoActivityTimeout: 100000,
    resolve: {
      alias: {
        'react': path.join(__dirname, 'node_modules', 'react')
      }
    }
  };

  option.files = [
    './node_modules/phantomjs-polyfill/bind-polyfill.js',
    'test/setup.js',
    { pattern: files, watch: false }
  ];
  option.preprocessors = {
    'src/**/*.js': ['webpack', 'sourcemap'],
    'test/setup.js': ['webpack', 'sourcemap']
  };
  option.preprocessors[files] = ['webpack', 'sourcemap'];

  config.set(option);
};
