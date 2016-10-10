import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';

export default (
  <Route path="/dnszones">
    <IndexRoute component={IndexPage} />
  </Route>
);
