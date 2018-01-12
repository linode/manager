import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import IndexPage from './layouts/IndexPage';
import NodebalancerPage from './nodebalancer';

export default (
  <Route path="/nodebalancers">
    <IndexRoute component={IndexPage} />
    {NodebalancerPage}
  </Route>
);
