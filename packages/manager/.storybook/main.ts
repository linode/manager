import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { getReactDocgenTSFileGlobs } from './utils';

const typeScriptFileGlobs = getReactDocgenTSFileGlobs();

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-measure',
    '@storybook/addon-actions',
    'storybook-dark-mode',
    '@storybook/addon-storysource',
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgenTypescriptOptions: {
      // Speeds up Storybook build time
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
      // makes union prop types like variant and size appear as select controls
      shouldExtractLiteralValuesFromEnum: true,
      // makes string and boolean types that can be undefined appear as inputs and switches
      shouldRemoveUndefinedFromOptional: true,
      // Filter out third-party props from node_modules except @mui packages
      propFilter: (prop) =>
        prop.parent
          ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName)
          : true,
      // Only compile files that have stories for faster local development performance
      include: /(development|test)/i.test(process.env.NODE_ENV ?? '')
        ? typeScriptFileGlobs
        : undefined,
    },
    reactDocgen: 'react-docgen-typescript',
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
      optimizeDeps: {
        include: [
          '@storybook/addon-viewport',
          '@storybook/blocks',
          '@storybook/theming',
          'storybook-dark-mode',
          'react-hook-form',
          'typescript-fsa-reducers',
          'css-mediaquery',
          'redux-mock-store',
          'redux-thunk',
          'redux',
          '@testing-library/react',
          'react-dom/test-utils',
        ],
      },
    });
  },
};

export default config;
