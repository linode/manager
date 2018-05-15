import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Toggle from './Toggle';

class Example extends React.Component<{}, { value?: string }> {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLFormElement>, value: string) => {
    this.setState(() => ({ value }));
  }

  render() {
    return (
      <React.Fragment>
        <Toggle label="This is a top label" labelTop />
        <Toggle label="This is a left label" />
      </React.Fragment>
    );
  }
}

storiesOf('Toggle', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive', () => (
    <Example />
  ));
