import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { IndexPage, AlertsPage, DisplayPage } from './layouts';
import AdvancedPage from './advanced';


export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="alerts" component={AlertsPage} />
    {AdvancedPage}
  </Route>
);
