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
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: { storyStoreV7: true },
  typescript: {
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Allow types to be infered from @mui packages
        if (prop.parent?.fileName.includes('@mui')) {
          return true;
        }

        // Default filter from https://github.com/joshwooding/vite-plugin-react-docgen-typescript/blob/main/src/utils/filter.ts
        return !prop.parent?.fileName.includes('node_modules');
      },
    },
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: './',
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
