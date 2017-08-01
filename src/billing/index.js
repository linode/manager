import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { ComingSoon } from 'linode-components/errors';


function placeholder() {
  return <ComingSoon feature="billing" classicLink="/account" />;
}

export default (
  <Route path="/billing">
    <IndexRoute component={placeholder} />
  </Route>
);
