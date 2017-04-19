import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import EditConfigPage from './layouts/EditConfigPage';
import AddConfigPage from './layouts/AddConfigPage';
import SettingsPage from './layouts/SettingsPage';

export default (
  <Route path=":nbLabel" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="settings" component={SettingsPage} />
    <Route path="configurations/create" component={AddConfigPage} />
    <Route path="configurations/:configId" component={EditConfigPage} />
  </Route>
);
