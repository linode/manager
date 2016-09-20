import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodePage from './linode';
import CreatePage from './create/layouts/IndexPage';

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    {LinodePage}
  </Route>
);
