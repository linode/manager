import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { Placeholder } from '~/linodes';
import { IndexPage, AlertsPage } from './layouts';

export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={Placeholder} />
    <Route path="alerts" component={AlertsPage} />
    <Route path="advanced" component={Placeholder} />
  </Route>
);
