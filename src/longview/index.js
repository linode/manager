import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LongviewPage from './client';

export default (
  <Route path="/longview">
    <IndexRoute component={IndexPage} />
    {LongviewPage}
  </Route>
);
