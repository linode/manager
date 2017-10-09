import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import InvoicePage from './layouts/InvoicePage';

export default (
  <Route path="/billing" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="invoice/:invoiceId" component={InvoicePage} />
  </Route>
);
