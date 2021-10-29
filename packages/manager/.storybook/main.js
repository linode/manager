const path = require('path');

module.exports = {
  core: { builder: "storybook-builder-vite" },
  stories: ['../src/components/**/*.stories.@(js|ts|jsx|tsx|mdx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-viewport',
  ],
  async viteFinal(config, { configType }) {
    config.envDir = '';
    config.define = { 'process.env': process.env };
    config.resolve.alias = {
      'src': path.resolve(__dirname, './src'),
      '@linode/validation': path.resolve(__dirname, '../validation/'),
      '@linode/api-v4': path.resolve(__dirname, '../api-v4/'),
    };

    
    return config;
  },
};
