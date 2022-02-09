'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.

/* eslint-disable sort-keys */
module.exports = {
  mode: 'development',
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // If we're in development, load our browser mocks. These will
    // only be active if REACT_APP_MOCK_SERVICE_WORKER is present
    // in the .env file, but including this through Webpack prevents
    // the production bundle from bloating.
    paths.browserMocks,
    // Finally, this is Cloud Manager's code:
    paths.appIndexJs,
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: (info) => {
      return path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/');
    },
    // Use a faster hash function
    hashFunction: 'xxhash64',
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.mjs', '.ts', '.tsx', '.js', '.json', '.jsx'],
    alias: {
      'src/': paths.appSrc,
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      new TsconfigPathsPlugin({ configFile: paths.appTsConfig }),
    ],
    fallback: {
      // Provide any Node.js polyfills here.
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      Buffer: 'buffer/',
    },
  },
  module: {
    strictExportPresence: true,
    unsafeCache: true,
    rules: [
      // @TODO what benefit does the source-map-loader provide?
      // {
      //   test: /\.(js|jsx|mjs)$/,
      //   loader: require.resolve('source-map-loader'),
      //   enforce: 'pre',
      //   include: paths.appSrc,
      // },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          {
            test: /\.svg$/,
            exclude: [/font-logos.svg$/],
            use: {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    // by default prefixes classes with svg path or random string
                    { prefixIds: { prefixIds: true, prefixClassNames: false } },
                    // by default removes the viewbox attribute
                    { removeViewBox: false },
                  ],
                },
              },
            },
          },
          {
            test: [/\.tsx$/, /\.ts$/],
            include: paths.appSrc,
            exclude: [/(stories|test)\.(ts|tsx)$/, /__data__/],
            use: [
              {
                loader: require.resolve('esbuild-loader'),
                options: {
                  loader: 'tsx',
                },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'esbuild-loader',
                options: {
                  loader: 'css',
                  minify: false,
                },
              },
            ],
          },
          {
            test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
            type: 'asset/resource',
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },
  plugins: [
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    // new InterpolateHtmlPlugin(env.raw),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
      PUBLIC_URL: publicUrl,
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // Perform type checking and linting in a separate process to speed up compilation
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        memoryLimit: 4096,
        tsconfig: paths.appTsConfig,
      },
      eslint: {
        memoryLimit: 4096,
        enabled: false,
        files: './src/**/*.{ts,tsx,js,jsx}',
      },
    }),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an async import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: paths.appSrc,
    }),
    // Allows us to use Node's Buffer in Cloud Manager
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  performance: {
    hints: false,
  },
  // The settings below are added to speed up the dev server
  // https://github.com/webpack/webpack/issues/12102#issuecomment-938544497
  optimization: {
    sideEffects: false,
    providedExports: false,
  },
  experiments: {
    cacheUnaffected: true,
  },
};
