import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CheckBox from './CheckBox';

class InteractiveCheckboxes extends React.Component {
  state = {
    checkedDefault: false,
    checkedWarning: false,
    checkedError: false
  };

  handleDefaultClick = () => {
    this.setState({ checkedDefault: !this.state.checkedDefault });
  };

  handleWarningClick = () => {
    this.setState({ checkedWarning: !this.state.checkedWarning });
  };

  handleErrorClick = () => {
    this.setState({ checkedError: !this.state.checkedError });
  };

  render() {
    return (
      <React.Fragment>
        <CheckBox disabled checked={false} onChange={this.handleDefaultClick} />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox disabled checked={true} onChange={this.handleDefaultClick} />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          checked={this.state.checkedDefault}
          onChange={this.handleDefaultClick}
        />
        <br />
        <br />
        <CheckBox
          variant="warning"
          disabled
          checked={false}
          onChange={this.handleWarningClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="warning"
          checked={true}
          onChange={this.handleDefaultClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="warning"
          checked={this.state.checkedWarning}
          onChange={this.handleWarningClick}
        />
        <br />
        <br />
        <CheckBox
          variant="error"
          disabled
          checked={false}
          onChange={this.handleErrorClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="error"
          checked={true}
          onChange={this.handleDefaultClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="error"
          checked={this.state.checkedError}
          onChange={this.handleErrorClick}
        />
      </React.Fragment>
    );
  }
}

storiesOf('CheckBox', module).add('Interactive', () => (
  <InteractiveCheckboxes />
));
