const webpack = require('webpack');

const asyncChunks = new webpack.optimize.CommonsChunkPlugin({
  async: true,
  minChunks: ({ resource }, count) => {
    return resource && /node_modules/.test(resource) && count > 1;
  },
});

const asyncChunkByModuleName = (moduleName) => new webpack.optimize.CommonsChunkPlugin({
  async: true,
  minChunks: ({ resource }, count) => {
    return resource && resource.indexOf(moduleName) > -1 && count > 1;
  },
});

const ignoreMomentLocales = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);

module.exports = {
  asyncChunks,
  asyncChunkByModuleName,
  ignoreMomentLocales,
};
