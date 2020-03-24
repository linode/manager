import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Grid from 'src/components/Grid';
import EnhancedNumberInput from './EnhancedNumberInput';

storiesOf('EnhancedNumberInput', module)
  .add('default', () => {
    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput />
      </Grid>
    );
  })
  .add('Small variant', () => {
    return (
      <Grid container style={{ padding: '2em' }}>
        <EnhancedNumberInput small />
      </Grid>
    );
  });
