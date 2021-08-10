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
      <>
        <FormControlLabel
          className="toggleLabel"
          control={<Toggle />}
          label="Example Label"
        />
        <Toggle checked={true} />
      </>
    );
  }
}

export default {
  title: 'UI Elements/Toggle',
};

export const Interactive = () => <Example />;
