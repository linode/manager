import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import * as tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import pluginCypress from 'eslint-plugin-cypress/flat';
import ramda from 'eslint-plugin-ramda';
import * as reactPlugin from 'eslint-plugin-react';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  // ignore files
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

  // 2. Base configuration including plugins
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      ramda,
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 3. Recommended configuration
  js.configs.recommended,
  sonarjs.configs.recommended,
  ramda.configs.recommended,
  pluginCypress.configs.recommended,
  ...compat.extends('plugin:testing-library/react'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:jsx-a11y/recommended'),
  ...compat.extends('plugin:perfectionist/recommended-natural'),

  // 4. Rules overrides
  {
    rules: {
      // jsx-a11y rules
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
      // react rules
      'react/display-name': 'off',

      'react/prop-types': 'off',

      // sonar
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-redundant-jump': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
    },
  },
]);
