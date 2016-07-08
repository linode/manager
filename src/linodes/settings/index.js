import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { IndexPage, AlertsPage } from './layouts';

export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={null} />
    <Route path="alerts" component={AlertsPage} />
    <Route path="advanced" component={null} />
  </Route>
);
