/* eslint-disable xss/no-mixed-html */
// Jest configurations
module.exports = {
  testResultsProcessor: 'jest-sonar-reporter',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['clover', 'json', 'text', 'lcov', 'cobertura'],
  setupFiles: ['<rootDir>/config/polyfills.js'],
  setupFilesAfterEnv: [
    '<rootDir>/config/testSetup.js',
    '<rootDir>/src/testSetup.ts',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.ts?(x)',
    '<rootDir>/src/**/?(*.)(spec|test).ts?(x)',
  ],
  testEnvironment: 'jsdom',
  testURL: 'https://api.linode.com',
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        $schema: 'http://json.schemastore.org/swcrc',
        jsc: {
          transform: {
            optimizer: {
              globals: {
                vars: {
                  'import.meta.env': '{}',
                },
              },
            },
          },
          experimental: {
            plugins: [['jest_workaround', {}]],
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/components/NullComponent',
    '^react-native$': 'react-native-web',
    ramda: 'ramda/src/index.js',
    '^src/(.*)': '<rootDir>/src/$1',
    '@linode/api-v4/lib(.*)$': '<rootDir>/../api-v4/src/$1',
    '@linode/validation/lib(.*)$': '<rootDir>/../validation/src/$1',
    '@linode/api-v4': '<rootDir>/../api-v4/src/index.ts',
    '@linode/validation': '<rootDir>/../validation/src/index.ts',
  },
  moduleFileExtensions: [
    'mjs',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'web.js',
    'js',
    'web.jsx',
    'jsx',
    'json',
    'node',
  ],
  reporters: ['default', 'jest-junit'],
};
