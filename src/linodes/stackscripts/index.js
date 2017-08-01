import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import StackScriptPage from './layouts/StackScriptPage';

export default (
  <Route path="/stackscripts">
    <IndexRoute component={IndexPage} />
    <Route path=":stackscriptId" component={StackScriptPage} />
  </Route>
);
