const custom = require('./webpack.config.js');
module.exports = {
  stories: ['../src/components/**/*.stories.@(js|ts|jsx|tsx|mdx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-viewport',
    '@storybook/preset-typescript',
  ],
  webpackFinal: (config) => ({
    ...config,
    resolve: { ...config.resolve, ...custom.resolve },
    module: { ...config.module },
  }),
};
