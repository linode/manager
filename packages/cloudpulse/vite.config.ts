import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { createRequire } from 'module';
import svgr from 'vite-plugin-svgr';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
// Safely read package.json in an ES Module environment
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Master list of all public packages we want to externalize
const externalDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
];
export default defineConfig({
    root: __dirname,
    plugins: [
        react(),
        svgr({
            svgrOptions: { exportType: 'default' },
            include: '**/*.svg',
        }),
        cssInjectedByJsPlugin(),
        dts({ rollupTypes: true, insertTypesEntry: true, logLevel: 'silent' })
    ],
    test: {
        env: {
            REACT_APP_CLIENT_ID: 'test-client-id',
        },
        maxWorkers: process.env.CI ? '50%' : undefined,
        testTimeout: 30000,
        hookTimeout: 30000,
        include: ['**/*.test.{js,jsx,ts,tsx}'],
        sequence: {
            groupOrder: 1,
        },
        environment: 'jsdom',
        globals: true,
        setupFiles: './testSetup.ts'
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CloudPulse',
            formats: ['es'],
            fileName: (format) => `cloudpulse.${format}.js`,
        },
        rollupOptions: {
            input: resolve(__dirname, 'src/index.ts'),            
            external: (id) => {
                // externalize all dependencies and peerDependencies to avoid bundling them into the library
                return externalDeps.some(dep => id === dep || id.startsWith(`${dep}/`));
            },
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    }
});