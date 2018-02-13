const webpack = require('webpack');
const p = require('../package');

const asyncChunkByModuleName = (moduleName) => new webpack.optimize.CommonsChunkPlugin({
  async: true,
  minChunks: ({ resource }, count) => {
    return resource && resource.indexOf(moduleName) > -1 && count > 1;
  },
});

const ignoreMomentLocales = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);

const envVariables = (environment) => new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(environment),
  },
  ENV_DEVTOOLS_DISABLED: JSON.stringify(process.env.DEVTOOLS_DISBLED),
  ENV_APP_ROOT: JSON.stringify(process.env.APP_ROOT),
  ENV_API_ROOT: JSON.stringify(process.env.API_ROOT),
  ENV_LOGIN_ROOT: JSON.stringify(process.env.LOGIN_ROOT),
  ENV_LISH_ROOT: JSON.stringify(process.env.LISH_ROOT),
  ENV_GA_ID: JSON.stringify(process.env.GA_ID),
  ENV_SENTRY_URL: JSON.stringify(process.env.SENTRY_URL),
  ENV_VERSION: JSON.stringify(p.version),
});

module.exports = {
  asyncChunkByModuleName,
  ignoreMomentLocales,
  envVariables,
};
