import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { AlertDetail } from '../AlertsDetail/AlertDetail';
import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';
import { EditAlertResources } from '../EditAlert/EditAlertResources';

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
        <EditAlertResources />
      </Route>
      <Route
        component={CreateAlertDefinition}
        path="/monitor/alerts/definitions/create"
      />
      <Route
        exact
        path="/monitor/alerts/definitions/edit/:serviceType/:alertId"
      >
        <EditAlertResources />
      </Route>
    </Switch>
  );
};
