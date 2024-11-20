import { Paper } from '@linode/ui';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Typography } from 'src/components/Typography';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route
        component={AlertDefinition}
        exact
        path="/monitor/alerts/definitions"
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
