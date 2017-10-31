import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './settings';

export default (
  <Route path=":lvLabel" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    {SettingsPage}
  </Route>
);
