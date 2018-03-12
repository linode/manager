import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
    MuiThemeProvider, 
    createMuiTheme,
  } from 'material-ui/styles';
import LinodeTheme from '../../src/theme';
import Button from 'material-ui/Button';

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

storiesOf('Button', module)
  .add('Primary', () => (
    <MuiThemeProvider theme={theme}>
			<Button
				variant="raised"
				color="primary"
			>
				Primary
			</Button>
		</MuiThemeProvider>
  ));
