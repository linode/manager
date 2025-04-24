import js from '@eslint/js';
import eslint from '@eslint/js';
import linodeRules from '@linode/eslint-plugin-cloud-manager/dist/index.js';
import * as tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginCypress from 'eslint-plugin-cypress/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import testingLibrary from 'eslint-plugin-testing-library';
import xss from 'eslint-plugin-xss';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Shared import restrictions applied across different rule contexts
const restrictedImportPaths = [
  'rxjs',
  '@mui/core',
  '@mui/system',
  '@mui/icons-material',
  {
    name: '@mui/material',
    importNames: ['Typography'],
    message:
      'Please use Typography component from @linode/ui instead of @mui/material',
  },
  {
    name: 'react-router-dom',
    importNames: ['Link'],
    message:
      'Please use the Link component from src/components/Link instead of react-router-dom',
  },
];

export const baseConfig = [
  // 1. Ignores
  {
    ignores: [
      '**/node_modules/*',
      '**/build/*',
      '**/dist/*',
      '**/lib/*',
      '**/storybook-static/*',
      '**/.storybook/*',
      '**/public/*',
    ],
  },

  // 2. TypeScript configuration
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

  // 3. Recommended configs
  eslint.configs.recommended,
  js.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  perfectionist.configs['recommended-natural'],
  pluginCypress.configs.recommended,
  react.configs.flat.recommended,
  reactHooks.configs['recommended-latest'],
  sonarjs.configs.recommended,
  tseslint.configs.recommended,

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
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-extra-boolean-cast': 'warn',
      'no-invalid-this': 'off',
      'no-loop-func': 'error',
      'no-mixed-requires': 'warn',
      'no-multiple-empty-lines': 'error',
      'no-new-wrappers': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedImportPaths,
          patterns: [
            {
              group: ['**/node_modules/cypress/**', 'cypress/**'],
              message:
                'Cypress modules should only be imported in testing directories',
            },
          ],
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
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react/display-name': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-useless-fragment': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'warn',
    },
  },

  // 6. TypeScript-specific
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

  // 7. XSS
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      xss,
    },
  },

  // 8. SonarJS
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
      'sonarjs/redundant-type-aliases': 'warn',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/single-character-alternation': 'warn',
      'sonarjs/no-duplicate-in-composite': 'warn',
      'sonarjs/no-nested-template-literals': 'off',
      'sonarjs/public-static-readonly': 'warn',
      'sonarjs/concise-regex': 'warn',
      'sonarjs/use-type-alias': 'warn',
    },
  },

  // 9. JSX A11y
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

  // 10. Perfectionist
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'perfectionist/sort-array-includes': 'warn',
      'perfectionist/sort-classes': 'warn',
      'perfectionist/sort-enums': 'warn',
      'perfectionist/sort-exports': 'warn',
      'perfectionist/sort-heritage-clauses': 'off',
      'perfectionist/sort-imports': [
        'warn',
        {
          customGroups: {
            type: {
              react: ['^react$', '^react-.+'],
              src: ['^src$'],
            },
            value: {
              react: ['^react$', '^react-.+'],
              src: ['^src$', '^src/.+'],
            },
          },
          groups: [
            ['react', 'builtin', 'external'],
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
          newlinesBetween: 'always',
        },
      ],
      'perfectionist/sort-interfaces': 'warn',
      'perfectionist/sort-intersection-types': 'off',
      'perfectionist/sort-jsx-props': 'warn',
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-named-exports': 'warn',
      'perfectionist/sort-named-imports': 'warn',
      'perfectionist/sort-object-types': 'warn',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-sets': 'off',
      'perfectionist/sort-switch-case': 'warn',
      'perfectionist/sort-union-types': 'warn',
    },
  },

  // 11. Cloud Manager
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      '@linode/cloud-manager': linodeRules,
    },
    rules: {
      '@linode/cloud-manager/no-custom-fontWeight': 'warn',
      '@linode/cloud-manager/deprecate-formik': 'warn',
      '@linode/cloud-manager/no-createLinode': 'off',
      '@linode/cloud-manager/no-mui-theme-spacing': 'warn',
    },
  },

  // 12. Unit tests, factories, mocks & stories
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.stories.{js,ts,tsx}',
      '**/factories/**/*.{js,ts,tsx}',
      '**/__data__/**/*.{js,ts,tsx}',
      '**/mocks/**/*.{js,ts,tsx}',
    ],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-escape': 'off',
      'no-empty-pattern': 'off',
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
          if (rule === 'prefer-explicit-assert') {
            return [`testing-library/${rule}`, 'off'];
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
      'sonarjs/no-wildcard-import': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/pseudo-random': 'off',
    },
  },

  // 13. Cypress
  {
    files: ['**/cypress/**/*.{js,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-unused-expressions': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      '@linode/cloud-manager/no-createLinode': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      // Maintain standard import restrictions but allow Cypress imports in Cypress files
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedImportPaths,
          // Intentionally omit patterns to allow Cypress imports in Cypress files
        },
      ],
    },
  },

  // 14. Tanstack Router (temporary)
  {
    files: [
      // for each new features added to the migration router, add its directory here
      'src/features/Betas/**/*',
      'src/features/Domains/**/*',
      'src/features/Firewalls/**/*',
      'src/features/Images/**/*',
      'src/features/Longview/**/*',
      'src/features/Managed/**/*',
      'src/features/NodeBalancers/**/*',
      'src/features/ObjectStorage/**/*',
      'src/features/PlacementGroups/**/*',
      'src/features/StackScripts/**/*',
      'src/features/Volumes/**/*',
      'src/features/VPCs/**/*',
    ],
    rules: {
      'no-restricted-imports': [
        // This needs to remain an error however trying to link to a feature that is not yet migrated will break the router
        // For those cases react-router-dom history.push is still needed
        // using `eslint-disable-next-line no-restricted-imports` can help bypass those imports
        'error',
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
                'Please use routing utilities intended for @tanstack/react-router.',
              name: 'react-router-dom',
            },
            {
              importNames: ['TabLinkList'],
              message:
                'Please use the TanStackTabLinkList component for components being migrated to TanStack Router.',
              name: 'src/components/Tabs/TabLinkList',
            },
            {
              importNames: ['OrderBy', 'default'],
              message:
                'Please use useOrderV2 hook for components being migrated to TanStack Router.',
              name: 'src/components/OrderBy',
            },
            {
              importNames: ['Prompt'],
              message:
                'Please use the TanStack useBlocker hook for components/features being migrated to TanStack Router.',
              name: 'src/components/Prompt/Prompt',
            },
          ],
        },
      ],
    },
  },

  // 15. Prettier (coming last as recommended)
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      prettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
    },
  },
];

export default defineConfig(baseConfig);
