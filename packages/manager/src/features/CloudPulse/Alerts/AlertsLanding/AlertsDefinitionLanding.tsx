import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route
        component={AlertDefinition}
        exact
        path="/monitor/cloudpulse/alerts/definitions"
      />
    </Switch>
  );
};

const AlertDefinition = () => {
  return (
    <Paper>
      <Typography variant="body1">Alert Definition</Typography>
    </Paper>
  );
};
