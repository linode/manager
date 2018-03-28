import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ExpansionPanel from './ExpansionPanel';
import ActionsPanel from './ActionsPanel';

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
))
.add('Interactive with actions.', () => (
  <Grid container alignItems="center">
    <Grid item xs={4}>
      <ExpansionPanel
        heading="Why is Linode the best?"
        actions={props => (
            <ActionsPanel>
              <Button variant="raised" color="primary">Save</Button>
              <Button>Cancel</Button>
            </ActionsPanel>
          )
        }
      >
        <p>Customer service!</p>
      </ExpansionPanel>
    </Grid>
  </Grid>
));
