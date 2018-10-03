import 'font-logos/assets/font-logos.css';
import * as React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';

import { light as theme } from 'src/themes';

const ThemeDecorator = (storyFn: Function) => {
  return (
    <MuiThemeProvider theme={theme}>
      { storyFn() }
    </MuiThemeProvider>
  );
};

export default ThemeDecorator;
