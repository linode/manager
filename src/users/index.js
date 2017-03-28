import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AddUserPage from './layouts/AddUserPage';
import UserPage from './user';

export default (
  <Route path="users">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={AddUserPage} />
    {UserPage}
  </Route>
);
