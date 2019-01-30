import { storiesOf } from '@storybook/react';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Toggle from './Toggle';

class Example extends React.Component<{}, { value?: string }> {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLFormElement>, value: string) => {
    this.setState(() => ({ value }));
  };

  render() {
    return (
      <FormControlLabel
        className="toggleLabel"
        control={<Toggle />}
        label="Example Label"
      />
    );
  }
}

storiesOf('Toggle', module).add('Interactive', () => <Example />);
