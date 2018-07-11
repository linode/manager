import 'font-logos/assets/font-logos.css';
import * as React from 'react';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import LinodeThemeLight from 'src/theme';

const theme = createMuiTheme(LinodeThemeLight as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

const ThemeDecorator = (storyFn: Function) => {
  return (
    <MuiThemeProvider theme={theme}>
      { storyFn() }
    </MuiThemeProvider>
  );
};

export default ThemeDecorator;
