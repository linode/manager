module.exports = {
  ignorePatterns: ['node_modules', 'lib', 'index.js', '!.eslintrc.js'],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    // Warning if you want to set tsconfig.json, you ll need laso to set `tsconfigRootDir:__dirname`
    // BUT we decided not to use this feature due to a very important performance impact
    // project: 'tsconfig.json',
    ecmaVersion: 2020,
    warnOnUnsupportedTypeScriptVersion: true
  },
  plugins: ['@typescript-eslint', 'sonarjs', 'prettier'],
  extends: [
    // disables a few of the recommended rules from the previous set that we know are already covered by TypeScript's typechecker
    'plugin:@typescript-eslint/eslint-recommended',
    // like eslint:recommended, except it only turns on rules from our TypeScript-specific plugin.
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
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
      '@material-ui/icons'
    ],
    'no-console': 'error',
    // allowing to init vars to undefined
    'no-undef-init': 'off',
    // radix: Codacy considers it as an error, i put it here to fix it before push
    // radix requires to give the base in parseInt https://eslint.org/docs/rules/radix
    radix: 'error',
    // typescript-eslint specific rules
    // prepend `_` to an arg you accept to ignore
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
    // sonar
    'sonarjs/cognitive-complexity': 'warn',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-redundant-jump': 'warn',
    'sonarjs/no-small-switch': 'warn',
    // style errors
    'no-multiple-empty-lines': 'error',
    curly: 'warn',
    'sort-keys': 'off',
    'comma-dangle': 'warn',
    'no-trailing-spaces': 'warn',
    'no-mixed-requires': 'warn',
    'spaced-comment': 'warn',
    'object-shorthand': 'warn',
    // make prettier issues warnings
    'prettier/prettier': 'warn'
  },
  overrides: [
    {
      files: ['webpack*.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
