import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import { IndexPage, AlertsPage, DisplayPage } from './layouts';
import AdvancedPage from './layouts/AdvancedPage';
import EditConfigPage from './layouts/EditConfigPage';
import AddConfigPage from './layouts/AddConfigPage';

export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="alerts" component={AlertsPage} />
    <Route path="advanced">
      <IndexRoute component={AdvancedPage} />
      <Route path="configs">
        <IndexRedirect to=".." />
        <Route path="create" component={AddConfigPage} />
        <Route path=":configId" component={EditConfigPage} />
      </Route>
    </Route>
  </Route>
);
