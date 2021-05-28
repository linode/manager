const custom = require('./webpack.config.js');
module.exports = {
  stories: ['../src/components/**/*.stories.@(js|ts|jsx|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-viewport',
  ],
  webpackFinal: (config) => ({
    ...config,
    resolve: { ...config.resolve, ...custom.resolve },
    module: { ...config.module, rules: custom.module.rules },
  }),
};
