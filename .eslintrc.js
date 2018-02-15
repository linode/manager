const path = require('path');

/**
 * Updading ESLint to the latest AirBnB config results in several thousand errors. We're going to
 * disable any rule that conflicts with our current config, then iteratively discuss and possibly
 * implement those rules throughout the codebase.
 * 
  694  http://eslint.org/docs/rules/function-paren-newline
  310  http://eslint.org/docs/rules/comma-dangle
  271  https://google.com/#q=react%2Fjsx-filename-extension
  236  https://google.com/#q=react%2Fforbid-prop-types
  225  http://eslint.org/docs/rules/object-curly-newline
  184  http://eslint.org/docs/rules/no-underscore-dangle
  155  http://eslint.org/docs/rules/arrow-parens
  147  https://google.com/#q=react%2Frequire-default-props
   92  https://google.com/#q=import%2Ffirst
   82  https://google.com/#q=jsx-a11y%2Flabel-has-for
   80  http://eslint.org/docs/rules/prefer-arrow-callback
   63  https://google.com/#q=import%2Fno-named-as-default
   58  http://eslint.org/docs/rules/no-shadow
   55  https://google.com/#q=jsx-a11y%2Fanchor-is-valid
   47  http://eslint.org/docs/rules/arrow-body-style
   43  https://google.com/#q=react%2Fjsx-closing-tag-location
   42  http://eslint.org/docs/rules/object-shorthand
   30  http://eslint.org/docs/rules/object-property-newline
   28  http://eslint.org/docs/rules/prefer-destructuring
   25  http://eslint.org/docs/rules/radix
   25  https://google.com/#q=react%2Fno-unused-prop-types
   22  https://google.com/#q=react%2Fno-array-index-key
   18  http://eslint.org/docs/rules/consistent-return
   18  https://google.com/#q=import%2Fno-duplicates
   17  https://google.com/#q=import%2Fprefer-default-export
   17  http://eslint.org/docs/rules/no-confusing-arrow
   15  https://google.com/#q=import%2Fextensions
   14  https://google.com/#q=import%2Fno-extraneous-dependencies
   13  https://google.com/#q=import%2Fno-unresolved
   13  http://eslint.org/docs/rules/no-plusplus
   12  https://google.com/#q=jsx-a11y%2Fclick-events-have-key-events
   12  https://google.com/#q=jsx-a11y%2Fno-static-element-interactions
   11  http://eslint.org/docs/rules/class-methods-use-this
   11  https://google.com/#q=react%2Fself-closing-comp
   10  https://google.com/#q=import%2Fno-webpack-loader-syntax
   10  https://google.com/#q=react%2Fno-unescaped-entities
   10  https://google.com/#q=react%2Fno-unused-state
    7  https://google.com/#q=react%2Fjsx-wrap-multilines
    7  https://google.com/#q=import%2Fno-named-default
    6  http://eslint.org/docs/rules/no-mixed-operators
    5  https://google.com/#q=react%2Fdefault-props-match-prop-types
    5  https://google.com/#q=react%2Fjsx-curly-brace-presence
    5  https://google.com/#q=import%2Fnewline-after-import
    4  http://eslint.org/docs/rules/no-await-in-loop
    4  http://eslint.org/docs/rules/no-restricted-globals
    4  http://eslint.org/docs/rules/dot-notation
    4  https://google.com/#q=react%2Fjsx-indent
    3  http://eslint.org/docs/rules/space-unary-ops
    3  http://eslint.org/docs/rules/array-callback-return
    3  http://eslint.org/docs/rules/spaced-comment
    2  https://google.com/#q=react%2Fprop-types
    2  https://google.com/#q=react%2Fjsx-no-bind
    2  https://google.com/#q=react%2Fno-did-mount-set-state
    2  http://eslint.org/docs/rules/no-restricted-syntax
    2  http://eslint.org/docs/rules/no-undef-init
    2  https://google.com/#q=react%2Fno-children-prop
    2  https://google.com/#q=react%2Fjsx-max-props-per-line
    2  http://eslint.org/docs/rules/no-unused-expressions
    1  https://google.com/#q=react%2Fjsx-no-duplicate-props
    1  https://google.com/#q=react%2Fsort-comp
    1  https://google.com/#q=react%2Fno-find-dom-node
    1  http://eslint.org/docs/rules/no-lonely-if
    1  https://google.com/#q=import%2Fno-dynamic-require
    1  http://eslint.org/docs/rules/no-extra-boolean-cast
    1  http://eslint.org/docs/rules/no-restricted-properties
    1  https://google.com/#q=jsx-a11y%2Falt-text
    1  http://eslint.org/docs/rules/no-return-await
 */

module.exports = {
  extends: 'airbnb',
  plugins: ['babel'],
  env: {
    browser: true,
    mocha: true,
    jest: true
  },
  parser: 'babel-eslint',
  settings: {
    'import/resolver': {
      webpack: {
        config: {
          resolve: {
            alias: {
              '~': path.resolve(__dirname, 'src/')
            }
          }
        }
      }
    }
  },
  rules: {
    'array-callback-return': 'off',
    'arrow-body-style': 'off',
    'arrow-parens': 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': 'off',
    'consistent-return': 'off',
    'dot-notation': 'off',
    'func-names': 'off',
    'function-paren-newline': 'off',
    'no-await-in-loop': 'off',
    'no-confusing-arrow': 'off',
    'no-extra-boolean-cast': 'off',
    'no-lonely-if': 'off',
    'no-mixed-operators': 'off',
    'no-plusplus': 'off',
    'no-restricted-globals': 'off',
    'no-restricted-properties': 'off',
    'no-restricted-syntax': 'off',
    'no-return-await': 'off',
    'no-shadow': 'off',
    'no-undef-init': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
    'object-shorthand': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'radix': 'off',

    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'import/extensions': 'off',
    'import/first': 'off',
    'import/newline-after-import': 'off',
    'import/no-duplicates': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-default': 'off',
    'import/no-unresolved': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'import/prefer-default-export': 'off',

    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',

    'react/default-props-match-prop-types': 'off',
    'react/forbid-prop-types': 'off',
    'react/jsx-closing-tag-location': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-indent': 'off',
    'react/jsx-max-props-per-line': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-no-duplicate-props': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/no-array-index-key': 'off',
    'react/no-children-prop': 'off',
    'react/no-did-mount-set-state': 'off',
    'react/no-find-dom-node': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-unused-prop-types': 'off',
    'react/no-unused-state': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/self-closing-comp': 'off',
    'react/sort-comp': 'off',
  }
}