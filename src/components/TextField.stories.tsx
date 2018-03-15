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
      placeholder="Active State"
      autoFocus
    >
      Active State
    </TextField>
  </MuiThemeProvider>
))
.add('Error', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Error State"
      errorText="This input needs further attention"
    >
      Error State
    </TextField>
  </MuiThemeProvider>
))
.add('Affirmative', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Affirmative State"
      affirmative
    >
      Affirmative State
    </TextField>
  </MuiThemeProvider>
))
.add('Disabled', () => (
  <MuiThemeProvider theme={theme}>
    <TextField
      label="Input Label"
      placeholder="Disabled State"
      disabled
    >
      Disabled State
    </TextField>
  </MuiThemeProvider>
))
;
