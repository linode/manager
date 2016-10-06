import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import {
  IndexPage,
  HistoryPage,
  SettingsPage,
} from './layouts';
import SummaryPage from './layouts/SummaryPage';

export default (
  <Route path="backups" component={IndexPage}>
    <IndexRoute component={SummaryPage} />
    <Route path="history" component={HistoryPage} />
    <Route path="settings" component={SettingsPage} />
  </Route>
);
