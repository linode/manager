import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import CreatePage from './layouts/CreatePage';
import ZonePage from './layouts/ZonePage';

export default (
  <Route path="/domains">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    <Route path=":domainLabel" component={ZonePage} />
  </Route>
);
