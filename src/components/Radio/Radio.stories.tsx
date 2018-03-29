import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Radio from './Radio';
import { RadioGroup } from 'material-ui/Radio';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

class Example extends React.Component<{}, { value?: string }> {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLFormElement>, value: string) => {
    this.setState(() => ({ value }));
  }

  render() {
    return (
      <RadioGroup
        aria-label="gender"
        name="gender"
        value={this.state.value}
        onChange={this.handleChange}
      >
        <FormControlLabel value="Disabled" label="Disabled" control={<Radio disabled />} />
        <FormControlLabel value="D" label="Default" control={<Radio />} />
        <FormControlLabel value="B" label="Warning" control={<Radio variant="warning" />} />
        <FormControlLabel value="A" label="Error" control={<Radio variant="error" />} />
      </RadioGroup>
    );
  }
}

storiesOf('Radio', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive', () => (
    <Example />
  ));
