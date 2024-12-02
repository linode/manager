import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route
        component={() => <AlertListing />}
        exact
        path="/monitor/alerts/definitions"
      />
      <Route
        component={() => <CreateAlertDefinition />}
        path="/monitor/alerts/definitions/create"
      />
    </Switch>
  );
};
