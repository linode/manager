import { storiesOf } from '@storybook/react';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import Radio from './Radio';

class Example extends React.Component<{}, { value?: string }> {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLFormElement>, value: string) => {
    this.setState(() => ({ value }));
  };

  render() {
    return (
      <RadioGroup
        aria-label="gender"
        name="gender"
        value={this.state.value}
        onChange={this.handleChange}
      >
        <FormControlLabel
          value="Disabled"
          label="Disabled"
          control={<Radio disabled />}
        />
        <FormControlLabel value="D" label="Default" control={<Radio />} />
        <FormControlLabel
          value="B"
          label="Warning"
          control={<Radio variant="warning" />}
        />
        <FormControlLabel
          value="A"
          label="Error"
          control={<Radio variant="error" />}
        />
      </RadioGroup>
    );
  }
}

storiesOf('Radio', module).add('Interactive', () => <Example />);
