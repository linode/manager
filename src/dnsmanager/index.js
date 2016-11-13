import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import CreatePage from './layouts/CreatePage';
import DNSZonePage from './layouts/DNSZonePage';

export default (
  <Route path="/dnsmanager">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    <Route path=":dnszoneId" component={DNSZonePage} />
  </Route>
);
