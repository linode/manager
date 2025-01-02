import { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../../ui/src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-controls'),
    getAbsolutePath('@storybook/addon-viewport'),
    getAbsolutePath('@storybook/addon-measure'),
    getAbsolutePath('@storybook/addon-actions'),
    getAbsolutePath('storybook-dark-mode'),
    getAbsolutePath('@storybook/addon-storysource'),
    getAbsolutePath('@storybook/addon-a11y'),
  ],
  staticDirs: ['../public'],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
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

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
