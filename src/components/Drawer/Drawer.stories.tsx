import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Drawer from './Drawer';
import Button from 'material-ui/Button';

class Example extends React.Component {
  state = { open: false };

  toggleDrawer = v => (e) => {
    this.setState({ open: v });
  }

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleDrawer(true)}>Click</Button>
        <Drawer title="My Drawer" open={this.state.open} onClose={this.toggleDrawer(false)} >
          Click
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
