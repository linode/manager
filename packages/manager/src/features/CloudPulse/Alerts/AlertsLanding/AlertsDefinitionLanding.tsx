import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { AlertDetail } from '../AlertsDetail/AlertDetail';
import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route
        component={AlertListing}
        exact
        path="/monitor/alerts/definitions"
      />
      <Route
        exact
        path="/monitor/alerts/definitions/detail/:serviceType/:alertId"
      >
        <AlertDetail />
      </Route>
      <Route
        component={CreateAlertDefinition}
        path="/monitor/alerts/definitions/create"
      />
    </Switch>
  );
};
