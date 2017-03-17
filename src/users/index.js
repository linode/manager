import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AddUserPage from './layouts/AddUserPage';
import EditUserPage from './layouts/EditUserPage';

export default (
  <Route path="users">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={AddUserPage} />
    <Route path=":username" component={EditUserPage}/>
  </Route>
);
