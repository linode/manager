import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { AlertDetail } from '../AlertsDetail/AlertDetail';
import { AlertListing } from '../AlertsListing/AlertListing';
import { CreateAlertDefinition } from '../CreateAlert/CreateAlertDefinition';
import { EditAlertLanding } from '../EditAlert/EditAlertLanding';

export const AlertDefinitionLanding = () => {
  const { url } = useRouteMatch();

  return (
    <Switch>
      <Route component={AlertListing} exact path={`${url}`} />
      <Route exact path={`${url}/detail/:serviceType/:alertId`}>
        <AlertDetail />
      </Route>
      <Route component={CreateAlertDefinition} path={`${url}/create`} />
      <Route exact path={`${url}/edit/:serviceType/:alertId`}>
        <EditAlertLanding />
      </Route>
    </Switch>
  );
};
