import { select } from '@storybook/addon-knobs';
import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import CssBaseline from 'src/components/core/CssBaseline';
import { ThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';

const options = {
  dark,
  light,
};

const ThemeDecorator = (story: Function) => {
  const key = select('theme', ['light', 'dark'], 'light');
  const content = story();

  return (
    <ThemeProvider theme={options[key](8)}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
};

export default ThemeDecorator;
