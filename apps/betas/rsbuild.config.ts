import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginSvgr } from '@rsbuild/plugin-svgr';


export default defineConfig({
  // html: {
  //   template: './index.html',
  // },
  // source: {
  //   entry: {
  //     index: './src/main.tsx',
  //   },
  // },
  plugins: [
    pluginReact(),
    pluginSvgr({ svgrOptions: { exportType: 'default' } }),
    pluginModuleFederation({
      name: 'betas',
      exposes: {
        './app': './src/App.tsx',
      },
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
});
