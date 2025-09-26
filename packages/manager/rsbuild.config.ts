import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig((ctx) => {
  return {
    source: {
      define: publicVars,
    },
    plugins: [
      pluginReact(),
      pluginSvgr({ svgrOptions: { exportType: 'default' } }),
      pluginModuleFederation({
        name: 'host',
        remotes: {
          betas:
            ctx.env === 'production'
              ? 'betas@https://betas.nussman.us/mf-manifest.json'
              : 'betas@http://localhost:4000/mf-manifest.json',
        },
        shareStrategy: 'loaded-first',
        // @todo don't share anything so there is true isolation between host and remote apps
        shared: {
          react: { singleton: true, eager: true, strictVersion: false },
          'react-dom': { singleton: true, eager: true, strictVersion: false },
          '@linode/ui': { singleton: true, eager: true, strictVersion: false },
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
  };
});
