import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Grid from 'src/components/Grid';
import HelpIcon from './HelpIcon';

storiesOf('HelpIcon', module)
  .add('default', () => (
    <HelpIcon text="There is some help text! Yada, yada, yada..." />
  ))
  .add('center', () => (
    <Grid container justify="center">
      <Grid item>
        <HelpIcon text="There is some help text! Yada, yada, yada..." />
      </Grid>
    </Grid>
  ))
  .add('left', () => (
    <Grid container justify="flex-start">
      <Grid item>
        <HelpIcon text="There is some help text! Yada, yada, yada..." />
      </Grid>
    </Grid>
  ))
  .add('right', () => (
    <Grid container justify="flex-end">
      <Grid item>
        <HelpIcon text="There is some help text! Yada, yada, yada..." />
      </Grid>
    </Grid>
  ));
