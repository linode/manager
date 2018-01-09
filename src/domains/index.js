import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import IndexPage from './layouts/IndexPage';
import ZonePage from './layouts/ZonePage';

export default (
  <Route path="/domains">
    <IndexRoute component={IndexPage} />
    <Route path=":domainLabel" component={ZonePage} />
  </Route>
);
