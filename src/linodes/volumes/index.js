import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { ComingSoon } from 'linode-components/errors';


function placeholder() {
  return <ComingSoon feature="volumes" classicLink="/volumes" />;
}

export default (
  <Route path="/volumes">
    <IndexRoute component={placeholder} />
  </Route>
);
