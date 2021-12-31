const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  target: 'node',
  output: {
    filename: './index.node.js',
    path: path.resolve(__dirname),
    library: '@linode/validation',
    libraryTarget: 'umd',
  },
  plugins: [
    new NpmDtsPlugin({
      logLevel: 'warn',
    }),
  ],
};
