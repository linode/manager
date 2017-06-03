import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './layouts/SettingsPage';
import AddConfigPage from './layouts/AddConfigPage';
import ConfigsPage from './configs';


export default (
  <Route path=":nbLabel">
    <Route path="" component={IndexPage}>
      <IndexRoute component={DashboardPage} />
      <Route path="settings" component={SettingsPage} />
      <Route path="configs/create" component={AddConfigPage} />
    </Route>
    {ConfigsPage}
  </Route>
);
