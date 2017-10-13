import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import HistoryPage from './layouts/HistoryPage';
import InvoicePage from './layouts/InvoicePage';
import CreditCardPage from './layouts/CreditCardPage';
import PaymentPage from './layouts/PaymentPage';

export default (
  <Route path="/billing" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="history" component={HistoryPage} />
    <Route path="invoice/:invoiceId" component={InvoicePage} />
    <Route path="creditcard" component={CreditCardPage} />
    <Route path="payment" component={PaymentPage} />
  </Route>
);
