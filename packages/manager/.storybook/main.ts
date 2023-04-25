import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  features: { storyStoreV7: true },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: './',
      publicDir: 'public',
      resolve: {
        preserveSymlinks: true,
      },
      define: {
        'process.env': {},
      },
    });
  },
};

export default config;
