const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    library: '@linode/validation',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  plugins: [
    new NpmDtsPlugin({
      logLevel: 'warn',
    }),
  ],
  performance: {
    hints: 'error',
    maxEntrypointSize: 1500000, // ~1.5 MiB
    maxAssetSize: 1500000, // ~1.5 MiB
  },
};
