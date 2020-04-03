module.exports = {
  ignorePatterns: [
    'node_modules',
    'build',
    '.storybook',
    'e2e',
    'public',
    '!.eslintrc.js'
  ],

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
    curly: 'warn',
    'no-unused-vars': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-eval': 'error',
    'no-invalid-this': 'error',
    'no-multiple-empty-lines': 'error',
    'no-new-wrappers': 'error',
    'no-restricted-imports': [
      'error',
      'rxjs',
      '@material-ui/core',
      '@material-ui/icons'
    ],
    'no-throw-literal': 'error',
    'comma-dangle': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
    'no-mixed-requires': 'error',
    'no-unused-expressions': 'error',
    'spaced-comment': 'warn',
    'object-shorthand': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/camelcase': 'off',
    'no-console': 'error',
    'sort-keys': 'warn',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-bind': 'error',
    'react/jsx-no-useless-fragment': 'error'
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
    },
    {
      // scrips, config and cypress files can use console
      files: ['scripts/**', 'config/**', 'testServer.js', 'cypress/**'],
      rules: {
        'no-console': 'off'
      },
      env: { node: true }
    }
  ]
};
