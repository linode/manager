import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

import Grid from 'src/components/Grid';

import ThemeDecorator from '../../utilities/storybookDecorators';

import HelpIcon from './HelpIcon';

storiesOf('HelpIcon', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(checkA11y)
  .add('default', () => (<HelpIcon text="There is some help text! Yada, yada, yada..." />))
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
