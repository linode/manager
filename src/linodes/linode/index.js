import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import RescuePage from './layouts/RescuePage';
import RebuildPage from './layouts/RebuildPage';
import ResizePage from './layouts/ResizePage.js';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './settings';
import BackupsPage from './backups';
import NetworkingPage from './networking';


export default (
  <Route path=":linodeLabel" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="rebuild" component={RebuildPage} />
    <Route path="resize" component={ResizePage} />
    <Route path="rescue" component={RescuePage} />
    {NetworkingPage}
    {BackupsPage}
    {SettingsPage}
  </Route>
);
