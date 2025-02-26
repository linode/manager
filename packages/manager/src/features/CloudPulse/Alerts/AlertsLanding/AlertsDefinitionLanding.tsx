import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { AlertDetail } from '../AlertsDetail/AlertDetail';
import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';
import { EditAlertLanding } from '../EditAlert/EditAlertLanding';

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
        exact
        path="/monitor/alerts/definitions/edit/:serviceType/:alertId"
      >
        <EditAlertLanding />
      </Route>
      <Route
        component={CreateAlertDefinition}
        path="/monitor/alerts/definitions/create"
      />
    </Switch>
  );
};
