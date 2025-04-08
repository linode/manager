import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../../shared/src/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../../ui/src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-measure',
    '@storybook/addon-actions',
    'storybook-dark-mode',
    '@storybook/addon-storysource',
    '@storybook/addon-a11y',
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
    },
    reactDocgen: 'react-docgen-typescript',
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      optimizeDeps: {
        include: [
          '@storybook/react',
          '@storybook/react-vite',
          'react',
          'react-dom',
        ],
        esbuildOptions: {
          target: 'esnext',
        },
      },
    });
  },
};

export default config;
