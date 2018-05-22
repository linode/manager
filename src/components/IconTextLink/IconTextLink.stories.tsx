import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

import PlusSquare from '../../../src/assets/icons/plus-square.svg';

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
          SideIcon={PlusSquare}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
        <br /><br />
        <IconTextLink
          disabled
          SideIcon={PlusSquare}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
      </React.Fragment>
    );
  }
}

storiesOf('IconTextLink', module)
.addDecorator(ThemeDecorator)
.addDecorator(checkA11y)
.add('Interactive', () => (
  <InteractiveIconTextLink />
))
;
