import * as React from 'react';
import { storiesOf } from '@storybook/react';

import {
    MuiThemeProvider, 
    createMuiTheme,
  } from 'material-ui/styles';

import LinodeTheme from '../../src/theme';
import TextField from './TextField';

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

storiesOf('TextField', module)
.add('Normal', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Normal State"
    >
      Normal State
    </TextField>
  </MuiThemeProvider>
))
.add('Active', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Normal State"
    >
      Normal State
    </TextField>
  </MuiThemeProvider>
))
.add('Error', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Normal State"
      error
    >
      Normal State
    </TextField>
  </MuiThemeProvider>
))
;
