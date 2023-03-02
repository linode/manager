import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: { storyStoreV7: true },
  async viteFinal(config) {
    // const plugins =  config.plugins?.filter(plugin => !Array.isArray(plugin));
    // config.plugins = plugins;
    console.log(config);
    return mergeConfig(config, {
      // root: `${__dirname}/../`,
      // cacheDir: path.resolve(__dirname, '../node_modules/.cache/vite'),
      resolve: {
        // alias: {
        //   src: `${__dirname}/../src`,
        // },
        preserveSymlinks: true,
      },
      define: {
        'process.env': {},
      },
      // plugins: []
    });
  },
};

export default config;
