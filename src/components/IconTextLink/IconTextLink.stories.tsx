import * as React from 'react';
import { storiesOf } from '@storybook/react';

import AddCircleOutline from 'material-ui-icons/AddCircleOutline';

import ThemeDecorator from '../../utilities/storybookDecorators';
import IconTextLink from './IconTextLink';

class InteractiveIconTextLink extends React.Component {
  state = {
    active: false,
  };

  handleClick = () => {
    alert('thanks for clicking!');
    this.setState({ active: true });
  }

  render() {
    return (
      <React.Fragment>
        <IconTextLink
          active={this.state.active}
          SideIcon={AddCircleOutline}
          onClick={this.handleClick}
          text="Add an object"
        />
        <br /><br />
        <IconTextLink
          disabled
          SideIcon={AddCircleOutline}
          onClick={this.handleClick}
          text="Add an object"
        />
      </React.Fragment>
    );
  }
}

storiesOf('IconTextLink', module)
.addDecorator(ThemeDecorator)
.add('Interactive', () => (
  <InteractiveIconTextLink />
))
;
