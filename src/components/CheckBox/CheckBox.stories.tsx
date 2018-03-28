import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import CheckBox from './CheckBox';

class InteractiveCheckboxes extends React.Component {
  state = {
    checkedDefault: false,
    checkedWarning: false,
    checkedError: false,
  };

  handleClick = (type: string) => {
    this.setState({ [type]: !this.state[type] });
  }

  render() {
    return (
      <React.Fragment>
        <CheckBox
          disabled
          checked={false}
          onChange={() => this.handleClick('checkedDefault')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          checked={true}
          onChange={() => this.handleClick('checkedDefault')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          checked={this.state.checkedDefault}
          onChange={() => this.handleClick('checkedDefault')}
        />
        <br /><br />
        <CheckBox
          variant="warning"
          disabled
          checked={false}
          onChange={() => this.handleClick('checkedWarning')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="warning"
          checked={true}
          onChange={() => this.handleClick('checkedDefault')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="warning"
          checked={this.state.checkedWarning}
          onChange={() => this.handleClick('checkedWarning')}
        />
        <br /><br />
        <CheckBox
          variant="error"
          disabled
          checked={false}
          onChange={() => this.handleClick('checkedError')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="error"
          checked={true}
          onChange={() => this.handleClick('checkedDefault')}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="error"
          checked={this.state.checkedError}
          onChange={() => this.handleClick('checkedError')}
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
