module.exports = {
  env: {
    browser: true,
  },
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
    'plugin:perfectionist/recommended-natural',
  ],
  ignorePatterns: [
    'node_modules',
    'build',
    'storybook-static',
    '.storybook',
    'e2e',
    'public',
    '!.eslintrc.js',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/ban-types': [
          'error',
          {
            extendDefaults: true,
            types: {
              '{}': false,
            },
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' },
        ],
        // eslint not typescript does a bad job with type aliases, we let typescript eslint do it
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['*js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      env: { node: true },
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
        '@typescript-eslint/no-empty-function': 'warn', // possible for tests
        '@typescript-eslint/no-var-requires': 'off',
        'array-callback-return': 'off',
        'no-unused-expressions': 'off',
      },
    },
    {
      env: {
        'cypress/globals': true,
        node: true,
      },
      // scrips, config and cypress files can use console
      files: ['scripts/**', 'config/**', 'cypress/**'],
      rules: {
        'no-console': 'off',
        // here we get false positives as cypress self handles async/await
        'testing-library/await-async-query': 'off',
      },
    },
    // restrict usage of react-router-dom during migration to tanstack/react-router
    // TODO: TanStack Router - remove this override when migration is complete
    {
      files: [
        // for each new features added to the migration router, add its directory here
        'src/features/Betas/**/*',
        'src/features/Volumes/**/*',
      ],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            paths: [
              {
                importNames: [
                  // intentionally not including <Link> in this list as this will be updated last globally
                  'useNavigate',
                  'useParams',
                  'useLocation',
                  'useHistory',
                  'useRouteMatch',
                  'matchPath',
                  'MemoryRouter',
                  'Route',
                  'RouteProps',
                  'Switch',
                  'Redirect',
                  'RouteComponentProps',
                  'withRouter',
                ],
                message:
                  'Please use routing utilities from @tanstack/react-router.',
                name: 'react-router-dom',
              },
              {
                importNames: ['renderWithTheme'],
                message:
                  'Please use the wrapWithThemeAndRouter helper function for testing components being migrated to TanStack Router.',
                name: 'src/utilities/testHelpers',
              },
            ],
          },
        ],
      },
    },
  ],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    // Warning if you want to set tsconfig.json, you ll need laso to set `tsconfigRootDir:__dirname`
    // BUT we decided not to use this feature due to a very important performance impact
    // project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    // Only ESLint 6.2.0 and later support ES2020.
    ecmaVersion: 2020,
    warnOnUnsupportedTypeScriptVersion: true,
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
    'perfectionist',
    '@linode/eslint-plugin-cloud-manager',
  ],
  rules: {
    '@linode/cloud-manager/deprecate-formik': 'warn',
    '@linode/cloud-manager/no-custom-fontWeight': 'error',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'warn',
    // this would disallow usage of ! postfix operator on non null types
    '@typescript-eslint/no-non-null-assertion': 'off',
    // This rules is disabled to avoid duplicates errors as no-unused-vars is set
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'array-callback-return': 'error',
    'comma-dangle': 'off', // Prettier and TS both handle and check for this one
    // radix: Codacy considers it as an error, i put it here to fix it before push
    curly: 'warn',
    // See: https://www.w3.org/TR/graphics-aria-1.0/
    'jsx-a11y/aria-role': [
      'error',
      {
        allowedInvalidRoles: [
          'graphics-document',
          'graphics-object',
          'graphics-symbol',
        ],
      },
    ],
    // typescript-eslint specific rules
    'no-await-in-loop': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-console': 'error',
    'no-eval': 'error',
    // turned off to allow arrow functions in React Class Component
    'no-invalid-this': 'off',
    // loop rules
    'no-loop-func': 'error',
    'no-mixed-requires': 'warn',
    // style errors
    'no-multiple-empty-lines': 'error',
    'no-new-wrappers': 'error',
    'no-restricted-imports': [
      'error',
      'rxjs',
      '@mui/core',
      '@mui/system',
      '@mui/icons-material',
    ],
    'no-throw-literal': 'warn',
    'no-trailing-spaces': 'warn',
    // allowing to init vars to undefined
    'no-undef-init': 'off',
    'no-unused-expressions': 'warn',
    // prepend `_` to an arg you accept to ignore
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'object-shorthand': 'warn',
    // Perfectionist
    'perfectionist/sort-array-includes': 'warn',
    'perfectionist/sort-classes': 'warn',
    'perfectionist/sort-enums': 'warn',
    'perfectionist/sort-exports': 'warn',
    'perfectionist/sort-imports': [
      'warn',
      {
        'custom-groups': {
          type: {
            react: ['react', 'react-*'],
            src: ['src*'],
          },
          value: {
            src: ['src/**/*'],
          },
        },
        groups: [
          ['builtin', 'libraries', 'external'],
          ['src', 'internal'],
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
          [
            'type',
            'internal-type',
            'parent-type',
            'sibling-type',
            'index-type',
          ],
        ],
        'newlines-between': 'always',
      },
    ],
    'perfectionist/sort-interfaces': 'warn',
    'perfectionist/sort-jsx-props': 'warn',
    'perfectionist/sort-map-elements': 'warn',
    'perfectionist/sort-named-exports': 'warn',
    'perfectionist/sort-named-imports': 'warn',
    'perfectionist/sort-object-types': 'warn',
    'perfectionist/sort-objects': 'warn',
    'perfectionist/sort-union-types': 'warn',
    // make prettier issues warnings
    'prettier/prettier': 'warn',
    // radix requires to give the base in parseInt https://eslint.org/docs/rules/radix
    radix: 'error',
    // ramda
    'ramda/prefer-ramda-boolean': 'off',
    // react and jsx specific rules
    'react/display-name': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-useless-fragment': 'warn',
    'react/no-unescaped-entities': 'warn',
    // requires the definition of proptypes for react components
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'scanjs-rules/assign_to_hostname': 'warn',
    'scanjs-rules/assign_to_href': 'warn',
    'scanjs-rules/assign_to_location': 'warn',
    'scanjs-rules/assign_to_onmessage': 'warn',
    'scanjs-rules/assign_to_pathname': 'warn',
    'scanjs-rules/assign_to_protocol': 'error',
    'scanjs-rules/assign_to_search': 'warn',
    'scanjs-rules/assign_to_src': 'warn',
    // Allow roles from WAI-ARIA graphics module proposal.
    'scanjs-rules/call_Function': 'error',
    // Prevent patterns susceptible to XSS, like '<div>' + userInput + '</div>'.
    'scanjs-rules/call_addEventListener': 'warn',
    'scanjs-rules/call_parseFromString': 'error',
    'scanjs-rules/new_Function': 'error',
    'scanjs-rules/property_crypto': 'error',
    'scanjs-rules/property_geolocation': 'error',
    // sonar
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-redundant-jump': 'warn',
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sort-keys': 'off',
    'spaced-comment': 'warn',
    // https://github.com/Rantanen/eslint-plugin-xss/blob/master/docs/rules/no-mixed-html.md
    'xss/no-mixed-html': [
      'error',
      {
        // It's only valid to assign HTML to variables/attributes named "_html" (for React's
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
        // dangerouslySetInnerHTML) and /sanitize/i (regex matching).
        htmlVariableRules: ['__html', 'sanitize/i'],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
