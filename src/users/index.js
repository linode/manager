import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import UserPage from './user';

export default (
  <Route path="users">
    <IndexRoute component={IndexPage} />
    {UserPage}
  </Route>
);
