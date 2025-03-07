import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { AlertDetail } from '../AlertsDetail/AlertDetail';
import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';
import { EditAlertLanding } from '../EditAlert/EditAlertLanding';

export const AlertDefinitionLanding = () => {
  return (
    <Switch>
      <Route component={AlertListing} exact path="/alerts/definitions" />
      <Route exact path="/alerts/definitions/detail/:serviceType/:alertId">
        <AlertDetail />
      </Route>
      <Route
        component={CreateAlertDefinition}
        path="/alerts/definitions/create"
      />
      <Route exact path="/alerts/definitions/edit/:serviceType/:alertId">
        <EditAlertLanding />
      </Route>
      <Route
        component={CreateAlertDefinition}
        path="/alerts/definitions/create"
      />
    </Switch>
  );
};
