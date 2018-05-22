import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

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
  .addDecorator(checkA11y)
  .add('Interactive', () => (
    <Example />
  ));
