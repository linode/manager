import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import CreatePage from './layouts/CreatePage';
import TicketPage from './layouts/TicketPage';

export default (
  <Route path="/support">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    <Route path=":ticketId" component={TicketPage} />
  </Route>
);
