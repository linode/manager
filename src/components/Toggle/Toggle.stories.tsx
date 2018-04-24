import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Toggle from './Toggle';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

class Example extends React.Component<{}, { value?: string }> {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLFormElement>, value: string) => {
    this.setState(() => ({ value }));
  }

  render() {
    return (
      <FormControlLabel
        className="toggleLabel"
        control={
          <Toggle />
        }
        label="Example Label"
      />
    );
  }
}

storiesOf('Toggle', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive', () => (
    <Example />
  ));
