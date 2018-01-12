import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import IndexPage from './layouts/IndexPage';


export default (
  <Route path="/images">
    <IndexRoute component={IndexPage} />
  </Route>
);
