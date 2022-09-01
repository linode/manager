module.exports = {
  ignorePatterns: [
    'node_modules',
    'build',
    '.storybook',
    'e2e',
    'public',
    '!.eslintrc.js',
  ],

  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    // Warning if you want to set tsconfig.json, you ll need laso to set `tsconfigRootDir:__dirname`
    // BUT we decided not to use this feature due to a very important performance impact
    // project: 'tsconfig.json',
    // Only ESLint 6.2.0 and later support ES2020.
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    warnOnUnsupportedTypeScriptVersion: true,
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'sonarjs',
    'ramda',
    'cypress',
    'prettier',
    'testing-library',
    'scanjs-rules',
    'xss',
  ],
  extends: [
    // disables a few of the recommended rules from the previous set that we know are already covered by TypeScript's typechecker
    'plugin:@typescript-eslint/eslint-recommended',
    // like eslint:recommended, except it only turns on rules from our TypeScript-specific plugin.
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:sonarjs/recommended',
    'plugin:ramda/recommended',
    'plugin:cypress/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:testing-library/react',
  ],
  rules: {
    // prepend `_` to an arg you accept to ignore
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-unused-expressions': 'warn',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-eval': 'error',
    'no-throw-literal': 'warn',
    // loop rules
    'no-loop-func': 'error',
    'no-await-in-loop': 'error',
    'array-callback-return': 'error',
    // turned off to allow arrow functions in React Class Component
    'no-invalid-this': 'off',
    'no-new-wrappers': 'error',
    'no-restricted-imports': [
      'error',
      'rxjs',
      '@material-ui/core',
      '@material-ui/icons',
    ],
    'no-console': 'error',
    // allowing to init vars to undefined
    'no-undef-init': 'off',
    // radix: Codacy considers it as an error, i put it here to fix it before push
    // radix requires to give the base in parseInt https://eslint.org/docs/rules/radix
    radix: 'error',
    // typescript-eslint specific rules
    // This rules is disabled to avoid duplicates errors as no-unused-vars is set
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    // this would disallow usage of ! postfix operator on non null types
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // react and jsx specific rules
    'react/display-name': 'off',
    // requires the definition of proptypes for react components
    'react/prop-types': 'off',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-no-bind': 'off',
    'react/no-unescaped-entities': 'warn',
    // sonar
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-redundant-jump': 'warn',
    'sonarjs/no-small-switch': 'warn',
    // ramda
    'ramda/prefer-ramda-boolean': 'off',
    // style errors
    'no-multiple-empty-lines': 'error',
    curly: 'warn',
    'sort-keys': 'off',
    'comma-dangle': 'off', // Prettier and TS both handle and check for this one
    'no-trailing-spaces': 'warn',
    'no-mixed-requires': 'warn',
    'spaced-comment': 'warn',
    'object-shorthand': 'warn',
    // make prettier issues warnings
    'prettier/prettier': 'warn',
    'scanjs-rules/assign_to_hostname': 'warn',
    'scanjs-rules/assign_to_href': 'warn',
    'scanjs-rules/assign_to_location': 'warn',
    'scanjs-rules/assign_to_onmessage': 'warn',
    'scanjs-rules/assign_to_pathname': 'warn',
    'scanjs-rules/assign_to_protocol': 'error',
    'scanjs-rules/assign_to_search': 'warn',
    'scanjs-rules/assign_to_src': 'warn',
    'scanjs-rules/call_addEventListener': 'warn',
    'scanjs-rules/call_Function': 'error',
    'scanjs-rules/call_parseFromString': 'error',
    'scanjs-rules/new_Function': 'error',
    'scanjs-rules/property_crypto': 'error',
    'scanjs-rules/property_geolocation': 'error',
    // Prevent patterns susceptible to XSS, like '<div>' + userInput + '</div>'.
    // https://github.com/Rantanen/eslint-plugin-xss/blob/master/docs/rules/no-mixed-html.md
    'xss/no-mixed-html': [
      'error',
      {
        // It's only valid to assign HTML to variables/attributes named "_html" (for React's
        // dangerouslySetInnerHTML) and /sanitize/i (regex matching).
        htmlVariableRules: ['__html', 'sanitize/i'],
        functions: {
          // Declare "sanitizeHTML" as a function that accepts HTML as input and output, and that
          // it's "safe", meaning callers can trust the output (but the output still can only be
          // assigned to a variable with the naming convention above).
          sanitizeHTML: {
            htmlInput: true,
            htmlOutput: true,
            safe: true,
          },
        },
      },
    ],
  },
  env: {
    browser: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // eslint not typescript does a bad job with type aliases, we let typescript eslint do it
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/ban-types': [
          'error',
          {
            extendDefaults: true,
            types: {
              '{}': false,
            },
          },
        ],
      },
    },
    {
      files: ['*js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      // node files
      files: [
        '**/*.test.*',
        '**/*.spec.js',
        '**/*.stories.js',
        'scripts/**',
        'config/**',
        'cypress/**',
      ],
      rules: {
        'array-callback-return': 'off',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'warn', // possible for tests
      },
      env: { node: true },
    },
    {
      // scrips, config and cypress files can use console
      files: ['scripts/**', 'config/**', 'cypress/**'],
      rules: {
        'no-console': 'off',
        // here we get false positives as cypress self handles async/await
        'testing-library/await-async-query': 'off',
      },
      env: {
        node: true,
        'cypress/globals': true,
      },
    },
  ],
};
