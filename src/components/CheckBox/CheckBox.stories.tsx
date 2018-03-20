import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import CheckBox from './CheckBox';

class InteractiveCheckboxes extends React.Component {
  state = {
    checked: false,
  };

  handleClick = () => {
    this.setState({ checked: !this.state.checked });
  }

  render() {
    return (
      <React.Fragment>
        <CheckBox
          checked={this.state.checked}
          onClick={this.handleClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          checked={false}
          onClick={this.handleClick}
        />
      </React.Fragment>
    );
  }
}

storiesOf('CheckBox', module)
.addDecorator(ThemeDecorator)
.add('Interactive', () => (
  <InteractiveCheckboxes />
))
;
