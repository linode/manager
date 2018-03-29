import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Drawer from './Drawer';
import Button from 'material-ui/Button';
import TextField from '../TextField';

class Example extends React.Component {
  state = { open: false };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleDrawer(true)}>Click</Button>
        <Drawer title="My Drawer" open={this.state.open} onClose={this.toggleDrawer(false)} >
          This is some test copy which acts as content for this Drawer component.
          It's very interesting and you should read all of it. This text has to be sufficiently
          long to test that it doesn't expand the drawer to an unreasonable width.
          <TextField
            label="Input Some Text"
            placeholder="This is a placeholder"
          />
          <Button
            variant="raised"
            color="primary"
            onClick={this.toggleDrawer(true)}
          >
            Save
          </Button>
          <Button
            onClick={this.toggleDrawer(true)}
          >
            Cancel
          </Button>
        </Drawer>
      </React.Fragment>
    );
  }
}

storiesOf('Drawer', module)
  .addDecorator(ThemeDecorator)
  .add('Example.', () => (
    <Example />
  ));
