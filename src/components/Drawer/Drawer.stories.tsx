import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Button from 'material-ui/Button';

import ActionsPanel from '../ActionsPanel';
import ThemeDecorator from '../../utilities/storybookDecorators';
import Drawer from './Drawer';
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
          <ActionsPanel>
            <Button
              variant="raised"
              color="primary"
            >
              Save
            </Button>
            <Button
              variant="raised"
              color="secondary"
              className="cancel"
            >
              Cancel
            </Button>
          </ActionsPanel>
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
