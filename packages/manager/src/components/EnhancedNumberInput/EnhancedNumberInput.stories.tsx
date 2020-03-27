import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Grid from 'src/components/Grid';
import EnhancedNumberInput from './EnhancedNumberInput';

storiesOf('Enhanced Number Input', module)
  .add('Default', () => {
    const [value, setValue] = React.useState<number>(0);

    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput value={value} setValue={setValue} />
      </Grid>
    );
  })
  .add('Small Variant', () => {
    const [value, setValue] = React.useState<number>(0);

    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput value={value} setValue={setValue} small />
      </Grid>
    );
  })
  .add('Disabled', () => {
    const [value, setValue] = React.useState<number>(0);

    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput value={value} setValue={setValue} disabled />
      </Grid>
    );
  });
