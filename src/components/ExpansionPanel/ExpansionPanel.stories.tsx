import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Grid from 'material-ui/Grid';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ExpansionPanel from './ExpansionPanel';

storiesOf('ExpansionPanel', module)
.addDecorator(ThemeDecorator)
.add('Interactive', () => (
  <Grid container alignItems="center">
    <Grid item xs={4}>
      <ExpansionPanel heading="Why is Linode the best?">
        <p>Customer service!</p>
      </ExpansionPanel>
    </Grid>
  </Grid>
));
