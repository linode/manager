import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Grid from 'src/components/Grid';
import EnhancedNumberInput from './EnhancedNumberInput';

storiesOf('EnhancedNumberInput', module)
  .add('Default', () => {
    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput inputValue={0} />
      </Grid>
    );
  })
  .add('Small Variant', () => {
    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput inputValue={0} small />
      </Grid>
    );
  });
