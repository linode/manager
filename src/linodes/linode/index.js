import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import NetworkingPage from './layouts/NetworkingPage';
import RescuePage from './layouts/RescuePage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './settings';
import BackupsPage from './backups';

const todo = (
  <section className="card">
    TODO
  </section>
);

export default (
  <Route path=":linodeId" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="networking" component={NetworkingPage} />
    <Route path="rebuild" component={() => todo} />
    <Route path="resize" component={() => todo} />
    <Route path="rescue" component={RescuePage} />
    {BackupsPage}
    {SettingsPage}
  </Route>
);
