// .storybook/preview.js
import { select, withKnobs } from '@storybook/addon-knobs';
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

export const decorators = [
  withKnobs,
  (Story) => {
    const _key = select('theme', ['light', 'dark'], 'light');

    return wrapWithTheme(
      <ThemeProvider theme={options[_key]}>
        <CssBaseline />
        <div
          style={{
            margin: '1rem',
            padding: '4rem',
            backgroundColor: options[_key]().cmrBGColors.bgApp,
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    );
  },
];
