const custom = require('./webpack.config.js');
const path = require('path');
const includePath = path.resolve(__dirname, '../../..');

module.exports = {
  stories: ['../src/components/**/*.stories.@(js|ts|jsx|tsx|mdx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-viewport',
  ],
  webpackFinal: (config) => {
    /**
     * Added logic to find svg config included with Storybook and tell it to excude all svgs.
     * In the return, we include our own SVG handlers.
     * https://github.com/storybookjs/storybook/issues/9070#issuecomment-635895868
     */
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test('.svg')
    );
    fileLoaderRule.exclude = /\.svg$/;

    return {
      ...config,
      resolve: { ...config.resolve, ...custom.resolve },
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /(font-logos.svg)$/,
            include: includePath,
            use: 'url-loader',
          },
          {
            test: /\.svg$/,
            exclude: [/font-logos.svg$/],
            enforce: 'pre',
            use: {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    // by default preffixes classes with svg path or random string
                    { prefixIds: false },
                    // by default removes the viewbox attribute
                    { removeViewBox: false },
                  ],
                },
              },
            },
          },
        ],
      },
    };
  },
};
