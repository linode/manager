import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { ComingSoon } from 'linode-components/errors';


function placeholder() {
  return <ComingSoon feature="images" classicLink="/images" />;
}

export default (
  <Route path="/images">
    <IndexRoute component={placeholder} />
  </Route>
);
