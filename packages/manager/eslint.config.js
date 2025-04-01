import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import pluginCypress from 'eslint-plugin-cypress/flat';
// import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const testingLibrary = require('eslint-plugin-testing-library');
const react = require('eslint-plugin-react');

// const reactPlugin = require('eslint-plugin-react');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  // 1. Ignores
  {
    ignores: [
      '**/node_modules/*',
      '**/build/*',
      '**/storybook-static/*',
      '**/.storybook/*',
      '**/public/*',
      '!.eslintrc.js',
    ],
  },

  // 2. Base TypeScript configuration
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
      },
    },
  },

  // 3. Recommended configs (using compat)
  js.configs.recommended,
  sonarjs.configs.recommended,
  pluginCypress.configs.recommended,
  react.configs.flat.recommended,
  reactHooks.configs['recommended-latest'],
  ...compat.extends('plugin:@typescript-eslint/eslint-recommended'),
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:jsx-a11y/recommended'),
  ...compat.extends('plugin:perfectionist/recommended-natural'),

  // 4. Base rules
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'array-callback-return': 'error',
      'comma-dangle': 'off',
      curly: 'warn',
      eqeqeq: 'warn',
      'no-await-in-loop': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'warn',
      'no-console': 'error',
      'no-eval': 'error',
      'no-extra-boolean-cast': 'warn',
      'no-invalid-this': 'off',
      'no-loop-func': 'error',
      'no-mixed-requires': 'warn',
      'no-multiple-empty-lines': 'error',
      'no-new-wrappers': 'error',
      'no-restricted-imports': [
        'error',
        'rxjs',
        '@mui/core',
        '@mui/system',
        '@mui/icons-material',
        {
          importNames: ['Typography'],
          message:
            'Please use Typography component from @linode/ui instead of @mui/material',
          name: '@mui/material',
        },
        {
          importNames: ['Link'],
          message:
            'Please use the Link component from src/components/Link instead of react-router-dom',
          name: 'react-router-dom',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          message:
            "The 'data-test-id' attribute is not allowed; use 'data-testid' instead.",
          selector: "JSXAttribute[name.name='data-test-id']",
        },
      ],
      'no-throw-literal': 'warn',
      'no-trailing-spaces': 'warn',
      'no-undef-init': 'off',
      'no-unused-expressions': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-escape': 'warn',
      'object-shorthand': 'warn',
      'sort-keys': 'off',
      'spaced-comment': 'warn',
    },
  },

  // 5. React and React Hooks
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
    },
    rules: {
      'react/display-name': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-useless-fragment': 'warn',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      // 'react-refresh/only-export-components': 'warn',
    },
  },

  // 6. TypeScript-specific rules
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          selector: 'variable',
          trailingUnderscore: 'allow',
        },
        {
          format: null,
          modifiers: ['destructured'],
          selector: 'variable',
        },
        {
          format: ['camelCase', 'PascalCase'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'parameter',
        },
        {
          format: ['PascalCase'],
          selector: 'typeLike',
        },
      ],
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
    },
  },

  // 5. SonarJS rules
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'sonarjs/arrow-function-convention': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/duplicates-in-character-class': 'warn',
      'sonarjs/no-clear-text-protocols': 'off',
      'sonarjs/no-commented-code': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-ignored-exceptions': 'warn',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/no-redundant-jump': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-single-boolean-return': 'off',
      'sonarjs/todo-tag': 'warn',
    },
  },

  // 6. Perfectionist rules
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'perfectionist/sort-array-includes': 'error',
      'perfectionist/sort-classes': 'error',
      'perfectionist/sort-enums': 'error',
      'perfectionist/sort-exports': 'error',
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
    },
  },

  // 7. JSX A11y rules
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
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
    },
  },

  // Tests & factories rules
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.factory.{js,ts,tsx}',
      '**/mocks/**/*.{js,ts,tsx}',
    ],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-escape': 'off',
      ...Object.fromEntries(
        Object.keys(testingLibrary.rules).map((rule) => {
          // Special case for consistent-data-testid which needs config
          if (rule === 'consistent-data-testid') {
            return [
              `testing-library/${rule}`,
              [
                'warn',
                {
                  testIdAttribute: 'data-testid',
                  testIdPattern: '^[a-z-]+$',
                },
              ],
            ];
          }
          // All other rules just get set to warn
          return [`testing-library/${rule}`, 'warn'];
        })
      ),
      // This will make all sonar rules warnings.
      // It is a good idea to keep them as such so that we don't introduce new issues that could trigger dependabot or security scripts.
      ...Object.fromEntries(
        Object.keys(sonarjs.rules).map((rule) => [`sonarjs/${rule}`, 'warn'])
      ),
      'sonarjs/arrow-function-convention': 'off',
      'sonarjs/enforce-trailing-comma': 'off',
      'sonarjs/file-header': 'off',
      'sonarjs/no-implicit-dependencies': 'off',
      'sonarjs/no-reference-error': 'off',
    },
  },
]);
