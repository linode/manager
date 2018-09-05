import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../utilities/storybookDecorators';
import TextField from './TextField';

interface State {
  error: string;
}

class InteractiveForm extends React.Component<{}, State> {
  state = {
    error: '',
  }

  validate = (e: any) => {
    if (!e.target.value.match('test')) {
      this.setState({
        error: 'This is an error'
      });
    }
    else {
      this.setState({
        error: ''
      });
    }
  }

  render() {
    const { error } = this.state;
    
    return (
      <TextField
        label="Test Texfield"
        errorText={error}
        onBlur={this.validate}
      />
    )
  }
}

storiesOf('Forms', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive form', () => (
    <div style={{ padding: 20 }}>
      <InteractiveForm />
    </div>
));
