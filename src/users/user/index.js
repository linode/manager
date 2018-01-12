import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import IndexPage from './layouts/IndexPage';
import EditUserPage from './layouts/EditUserPage';
import PermissionsPage from './layouts/PermissionsPage';

export default (
  <Route path=":username" component={IndexPage}>
    <IndexRoute component={EditUserPage} />
    <Route path="permissions" component={PermissionsPage} />
  </Route>
);
