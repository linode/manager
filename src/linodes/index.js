import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodePage from './linode';

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    {LinodePage}
  </Route>
);
