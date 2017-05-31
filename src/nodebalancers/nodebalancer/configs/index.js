import React from 'react';
import { Route } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import EditConfigPage from './layouts/EditConfigPage';
import AddConfigPage from './layouts/AddConfigPage';


export default (
  <Route path="configs" component={IndexPage}>
    <Route path="create" component={AddConfigPage} />
    <Route path=":configId" component={DashboardPage} />
    <Route path=":configId/settings" component={EditConfigPage} />
  </Route>
);
