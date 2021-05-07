// .storybook/preview.js
import { select } from '@storybook/addon-knobs';
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

const key = select('theme', ['light', 'dark'], 'light');

export const decorators = [
  (Story) =>
    wrapWithTheme(
      <ThemeProvider theme={options[key]}>
        <CssBaseline />
        <div style={{ margin: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
];
