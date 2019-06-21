import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Button from 'src/components/Button';
import ActionsPanel from '../ActionsPanel';
import TextField from '../TextField';
import Drawer from './Drawer';

class Example extends React.Component {
  state = { open: false };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleDrawer(true)} data-qa-toggle-drawer>
          Click
        </Button>
        <Drawer
          title="My Drawer"
          open={this.state.open}
          onClose={this.toggleDrawer(false)}
        >
          This is some test copy which acts as content for this Drawer
          component. It's very interesting and you should read all of it. This
          text has to be sufficiently long to test that it doesn't expand the
          drawer to an unreasonable width.
          <TextField
            label="Input Some Text"
            placeholder="This is a placeholder"
            data-qa-text-field
          />
          <ActionsPanel>
            <Button buttonType="primary" data-qa-save>
              Save
            </Button>
            <Button buttonType="secondary" className="cancel" data-qa-cancel>
              Cancel
            </Button>
          </ActionsPanel>
        </Drawer>
      </React.Fragment>
    );
  }
}

storiesOf('Drawer', module).add('Example', () => <Example />);
