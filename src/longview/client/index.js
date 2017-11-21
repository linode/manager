import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import NetworkPage from './layouts/NetworkPage';
import DisksPage from './layouts/DisksPage';
import ProcessesPage from './layouts/ProcessesPage';
import SystemPage from './layouts/SystemPage';
import NginxPage from './layouts/NginxPage';
import ApachePage from './layouts/ApachePage';
import MySQLPage from './layouts/MySQLPage';
import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './settings';

export default (
  <Route path=":lvLabel" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="network" component={NetworkPage} />
    <Route path="disks" component={DisksPage} />
    <Route path="processes" component={ProcessesPage} />
    <Route path="system" component={SystemPage} />
    <Route path="nginx" component={NginxPage} />
    <Route path="apache" component={ApachePage} />
    <Route path="mysql" component={MySQLPage} />
    {SettingsPage}
  </Route>
);
