import React from 'react';
import { Route, IndexRoute } from 'react-router';
import {
  IndexPage,
  SettingsPage,
  BackupPage,
} from './layouts';
import SummaryPage from './layouts/SummaryPage';

export default (
  <Route path="backups" component={IndexPage}>
    <IndexRoute component={SummaryPage} />
    <Route path="settings" component={SettingsPage} />
    <Route path=":backupId" component={BackupPage} />
  </Route>
);
