const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    library: '@linode/api-v4',
    libraryTarget: 'umd',
  },
  plugins: [
    new NpmDtsPlugin({
      logLevel: 'warn',
    }),
  ],
};
