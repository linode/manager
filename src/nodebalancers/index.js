import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import CreatePage from './layouts/CreatePage';
import NodebalancerPage from './nodebalancer';

export default (
  <Route path="/nodebalancers">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    {NodebalancerPage}
  </Route>
);
