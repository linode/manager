import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import { IndexPage, AlertsPage } from './layouts';
import AdvancedPage from './layouts/AdvancedPage';

export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={AlertsPage} />
    <Route path="advanced">
      <IndexRoute component={AdvancedPage} />
      <Route path="configs">
        <IndexRedirect to=".." />
        <Route path=":configId" component={AdvancedPage} />
      </Route>
    </Route>
  </Route>
);
