import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './layouts/SettingsPage';
import ConfigsPage from './configs';


export default (
  <Route path=":nbLabel">
    <Route path="" component={IndexPage}>
      <IndexRoute component={DashboardPage} />
      <Route path="settings" component={SettingsPage} />
    </Route>
    {ConfigsPage}
  </Route>
);
