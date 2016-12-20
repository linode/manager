import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import RescuePage from './layouts/RescuePage';
import RebuildPage from './layouts/RebuildPage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './settings';
import BackupsPage from './backups';
import NetworkingPage from './networking';

const todo = (
  <section className="card">
    TODO
  </section>
);

export default (
  <Route path=":linodeLabel" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="rebuild" component={RebuildPage} />
    <Route path="resize" component={() => todo} />
    <Route path="rescue" component={RescuePage} />
    {NetworkingPage}
    {BackupsPage}
    {SettingsPage}
  </Route>
);
