import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import IndexPage from './layouts/IndexPage';
import UserPage from './user';

export default (
  <Route path="users">
    <IndexRoute component={IndexPage} />
    {UserPage}
  </Route>
);
