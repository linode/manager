import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
    MuiThemeProvider, 
    createMuiTheme,
  } from 'material-ui/styles';
import LinodeTheme from '../../src/theme';
import Button from 'material-ui/Button';

import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp';

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
			<br /><br />
			<Button
				variant="raised"
				color="primary"
				disabled
			>
				Disabled
			</Button>
		</MuiThemeProvider>
	))
	.add('Secondary', () => (
    <MuiThemeProvider theme={theme}>
			<Button
				variant="raised"
				color="secondary"
			>
				Secondary
			</Button>
			<br /><br />
			<Button
				variant="raised"
				color="secondary"
				disabled
			>
				Disabled
			</Button>
		</MuiThemeProvider>
	))
	.add('Primary Dropdown', () => (
    <MuiThemeProvider theme={theme}>
			<Button
          variant="raised"
          color="primary"
          className="button-dropdown"
        >
					Primary Dropdown
          <KeyboardArrowDown className="caret"></KeyboardArrowDown>
        </Button>
			<br /><br />
			<Button
          variant="raised"
          color="primary"
          className="button-dropdown"
        >
					Primary Dropdown Active
          <KeyboardArrowUp className="caret"></KeyboardArrowUp>
        </Button>
			<br /><br />
			<Button
          variant="raised"
					color="primary"
					disabled
          className="button-dropdown"
        >
					Primary Dropdown
          <KeyboardArrowDown className="caret"></KeyboardArrowDown>
        </Button>
		</MuiThemeProvider>
	))
	.add('Secondary Dropdown', () => (
    <MuiThemeProvider theme={theme}>
			<Button
          variant="raised"
          color="secondary"
          className="button-dropdown"
        >
					Primary Dropdown
          <KeyboardArrowDown className="caret"></KeyboardArrowDown>
        </Button>
			<br /><br />
			<Button
          variant="raised"
          color="secondary"
          className="button-dropdown"
        >
					Primary Dropdown Active
          <KeyboardArrowUp className="caret"></KeyboardArrowUp>
        </Button>
			<br /><br />
			<Button
          variant="raised"
					color="secondary"
					disabled
          className="button-dropdown"
        >
					Primary Dropdown
          <KeyboardArrowDown className="caret"></KeyboardArrowDown>
        </Button>
		</MuiThemeProvider>
	))
	.add('Destructive', () => (
    <MuiThemeProvider theme={theme}>
			<Button
				variant="raised"
				color="secondary"
				className="destructive"
			>
				Destructive
			</Button>
			<br /><br />
			<Button
				variant="raised"
				color="secondary"
				disabled
			>
				Disabled
			</Button>
		</MuiThemeProvider>
	))
	;
	
