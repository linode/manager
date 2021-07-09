// .storybook/preview.js
import { select, withKnobs } from '@storybook/addon-knobs';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { configure } from '@storybook/react';
import React from 'react';
import '../public/fonts/fonts.css';
import CssBaseline from '../src/components/core/CssBaseline';
import { ThemeProvider } from '../src/components/core/styles';
import '../src/index.css';
import { dark, light } from '../src/themes';
import { wrapWithTheme } from '../src/utilities/testHelpers';

const options = {
  dark,
  light,
};

configure(require.context('../src', true, /\.stories\.mdx$/), module);

export const decorators = [
  withKnobs,
  (Story) => {
    const _key = select('theme', ['light', 'dark'], 'light');

    return wrapWithTheme(
      <ThemeProvider theme={options[_key]}>
        <CssBaseline />
        {/* Keep this in case we want to change the background color based on the mode */}
        {/* <div
          style={{
            backgroundColor: options[_key]().cmrBGColors.bgApp,
          }}
        > */}
        <Story />
        {/* </div> */}
      </ThemeProvider>
    );
  },
];

MINIMAL_VIEWPORTS.mobile1.styles = {
  height: '667px',
  width: '375px',
};

export const parameters = {
  layout: 'centered',
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
};
