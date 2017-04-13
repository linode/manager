import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';


export default (
  <Route path="/billing" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
  </Route>
);
