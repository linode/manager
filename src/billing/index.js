import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import DashboardPage from './layouts/DashboardPage';
import ContactPage from './layouts/ContactPage';
import HistoryPage from './layouts/HistoryPage';
import InvoicePage from './layouts/InvoicePage';
import CreditCardPage from './layouts/CreditCardPage';
import PaymentPage from './layouts/PaymentPage';
import MakeAPaymentPage from './layouts/MakeAPaymentPage';

export default (
  <Route path="/billing" component={IndexPage}>
    <IndexRoute component={DashboardPage} />
    <Route path="history" component={HistoryPage} />
    <Route path="contact" component={ContactPage} />
    <Route path="history/invoice/:invoiceId" component={InvoicePage} />
    <Route path="history/payment/:paymentId" component={PaymentPage} />
    <Route path="creditcard" component={CreditCardPage} />
    <Route path="payment" component={MakeAPaymentPage} />
  </Route>
);
