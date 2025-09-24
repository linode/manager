import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig((ctx) => ({
  source: {
    define: publicVars,
  },
  plugins: [
    pluginReact(),
    pluginSvgr({ svgrOptions: { exportType: 'default' } }),
    pluginModuleFederation({
      name: 'host',
      remotes: {
        betas: 'betas@http://localhost:4000/mf-manifest.json',
      },
      shared: {
        react: { singleton: true, eager: true, strictVersion: false },
        'react-dom': { singleton: true, eager: true, strictVersion: false },
        '@linode/ui': { singleton: true, eager: true, strictVersion: false }
      },
    }),
  ],
  server: {
    port: 3000,
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            resourceQuery: /url$/,
            type: 'asset/resource',
          },
          {
            resourceQuery: /raw$/,
            type: 'asset/source',
          },
        ],
      },
    },
  },
}));
