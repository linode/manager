module.exports = {
  ignorePatterns: ['node_modules', 'build', '.storybook', 'e2e', 'public'],

  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    // Only ESLint 6.2.0 and later support ES2020.
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true
    },
    tsconfigRootDir: './',
    warnOnUnsupportedTypeScriptVersion: true
  },
  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'cypress',
    'prettier'
  ],
  extends: [
    // disables a few of the recommended rules from the previous set that we know are already covered by TypeScript's typechecker
    'plugin:@typescript-eslint/eslint-recommended',
    // like eslint:recommended, except it only turns on rules from our TypeScript-specific plugin.
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:cypress/recommended',
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    '@typescript-eslint/camelcase': 'off'
  },
  env: {
    browser: true,
    'cypress/globals': true
  },
  overrides: [
    {
      files: ['*js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    },
    {
      // node files
      files: [
        '**/*.spec.js',
        '**/*.stories.js',
        'scripts/**',
        'config/**',
        'testServer.js',
        'cypress/plugins/**'
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'warn' // possible for tests
      },
      env: { node: true }
    }
  ]
};
