import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Button from 'material-ui/Button';

import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp';

import ThemeDecorator from '../utilities/storybookDecorators';

storiesOf('Button', module)
.addDecorator(ThemeDecorator)
.add('Primary', () => (
  <React.Fragment>
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
  </React.Fragment>
))
.add('Secondary', () => (
  <React.Fragment>
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
  </React.Fragment>
))
.add('Primary Dropdown', () => (
  <React.Fragment>
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
  </React.Fragment>
))
.add('Secondary Dropdown', () => (
  <React.Fragment>
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
  </React.Fragment>
))
.add('Destructive', () => (
  <React.Fragment>
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
  </React.Fragment>
))
;
