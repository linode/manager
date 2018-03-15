import * as React from 'react';
import {
  MuiThemeProvider,
  createMuiTheme,
} from 'material-ui/styles';
import LinodeTheme from '../theme';

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

const ThemeDecorator = (storyFn: Function) => {
  return (
    <MuiThemeProvider theme={theme}>
      { storyFn() }
    </MuiThemeProvider>
  );
};

export default ThemeDecorator;
