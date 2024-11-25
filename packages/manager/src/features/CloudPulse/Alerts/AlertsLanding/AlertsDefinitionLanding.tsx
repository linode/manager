import { Paper, Typography } from '@linode/ui';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route
        component={AlertDefinition}
        exact
        path="/monitor/alerts/definitions"
      />
      <Route
        component={() => <CreateAlertDefinition />}
        path="/monitor/cloudpulse/alerts/definitions/create"
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
