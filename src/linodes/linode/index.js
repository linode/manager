import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import RescuePage from './layouts/RescuePage';
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
  <Route path=":linodeId" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="rebuild" component={() => todo} />
    <Route path="resize" component={() => todo} />
    <Route path="rescue" component={RescuePage} />
    {NetworkingPage}
    {BackupsPage}
    {SettingsPage}
  </Route>
);
