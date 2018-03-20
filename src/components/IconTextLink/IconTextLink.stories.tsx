import * as React from 'react';
import { storiesOf } from '@storybook/react';

import AddCircleOutline from 'material-ui-icons/AddCircleOutline';

import ThemeDecorator from '../../utilities/storybookDecorators';
import IconTextLink from './IconTextLink';

class InteractiveIconTextLink extends React.Component {
  handleClick = () => {
    alert('thanks for clicking!');
  }

  render() {
    return (
      <IconTextLink
        SideIcon={AddCircleOutline}
        onClick={this.handleClick}
        text="Add an object"
      />
    );
  }
}

storiesOf('IconTextLink', module)
.addDecorator(ThemeDecorator)
.add('Interactive', () => (
  <InteractiveIconTextLink />
))
;
