import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginSvgr } from '@rsbuild/plugin-svgr';


export default defineConfig(({ env }) => ({
  plugins: [
    pluginReact(),
    pluginSvgr({ svgrOptions: { exportType: 'default' } }),
    pluginModuleFederation({
      name: 'betas',
      exposes: {
        './app': './src/App.tsx',
      },
      getPublicPath: env === 'production' ? `function() {return "https://betas.nussman.us/"}` : undefined,
      // @todo don't share anything so there is true isolation between host and remote apps
      shared: {
        'react': { singleton: true, eager: true, strictVersion: false },
        'react-dom': { singleton: true, eager: true, strictVersion: false },
        '@linode/ui': { singleton: true, eager: true, strictVersion: false },
      }
    }),
  ],
  server: {
    port: 4000,
  },
}));
