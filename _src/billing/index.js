import React, { Component } from 'react';
import { Switch, Route, Redirect, matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { setAnalytics } from '~/actions';
import api from '~/api';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import TabsComponent from '~/components/Tabs';

import DashboardPage from './layouts/DashboardPage';
import ContactPage from './layouts/ContactPage';
import HistoryPage from './layouts/HistoryPage';
import InvoicePage from './layouts/InvoicePage';
import CreditCardPage from './layouts/CreditCardPage';
import PaymentPage from './layouts/PaymentPage';
import MakeAPaymentPage from './layouts/MakeAPaymentPage';

export class BillingIndex extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['billing']));
  }

  render() {
    const {
      match: { path, url },
      location: { pathname },
    } = this.props;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
      { name: 'Contact Info', to: `${url}/contact`, selected: matched(`${url}/contact`) },
      {
        name: 'Update Credit Card',
        to: `${url}/creditcard`,
        selected: matched(`${url}/creditcard`),
      },
      { name: 'Make a Payment', to: `${url}/payment`, selected: matched(`${url}/payment`) },
      { name: 'History', to: `${url}/history`, selected: matched(`${url}/history`) },
    ];

    return (
      <div>
        <ChainedDocumentTitle title="Billing" />
        <header className="main-header">
          <div className="container">
            <h1 className="float-sm-left">Billing</h1>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${path}/contact`} component={ContactPage} />
            <Route path={`${path}/creditcard`} component={CreditCardPage} />
            <Route path={`${path}/payment`} component={MakeAPaymentPage} />
            <Route path={`${path}/history/invoice/:invoiceId`} component={InvoicePage} />
            <Route path={`${path}/history/payment/:paymentId`} component={PaymentPage} />
            <Route path={`${path}/history`} component={HistoryPage} />
            <Route path={path} exact component={DashboardPage} />
            <Redirect to="/not-found" />
          </Switch >
        </div>
      </div>
    );
  }
}

BillingIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const preloadRequest = async (dispatch) => {
  await Promise.all([
    api.account.one(),
    api.invoices.all(),
    api.payments.all(),
  ].map(dispatch));
};

export default compose(
  connect(),
  Preload(preloadRequest)
)(BillingIndex);
