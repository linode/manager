import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import FormGroup from 'linode-components/dist/forms/FormGroup';

import { setSource } from '~/actions/source';
import Currency from '~/components/Currency';

import { BillingHistoryList } from '../components/BillingHistoryList';


export class DashboardPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { account } = this.props;

    const address = [
      account.company,
      `${account.first_name} ${account.last_name}`,
      account.address_1,
      account.address_2,
      account.city && account.state ?
        `${account.city}, ${account.state} ${account.zip ? account.zip : ''}`
        : null,
    ].map((t, i) => (t ? <li key={i}>{t}</li> : null));

    let balanceHint = 'Your account is current.';
    if (account.balance > 0) {
      balanceHint = (
        <a href="/billing/payment">
          Please pay now to avoid any service interruptions.
        </a>
      );
    } else if (account.balance < 0) {
      balanceHint = 'This will be applied towards future invoices.';
    }

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Account Information" />}>
            <h3 className="sub-header">Contact</h3>
            <FormGroup className="row" name="account-form">
              <div className="col-sm-2 row-label">
                Address
              </div>
              <div className="col-sm-10">
                <ul className="list-unstyled" id="address">
                  {address}
                </ul>
              </div>
            </FormGroup>
            <FormGroup className="row" name="email">
              <div className="col-sm-2 row-label">
                Email
              </div>
              <div className="col-sm-10" id="email">
                {account.email}
              </div>
            </FormGroup>
            <h3 className="sub-header">Recent Billing Activity</h3>
            <FormGroup className="row" name="history">
              <div className="col-sm-12">
                <BillingHistoryList payments={[]} {...this.props} days={30} />
              </div>
            </FormGroup>
            <FormGroup className="row" name="billing-history">
              <div className="col-sm-12 text-right">
                <Link to="/billing/history">Billing History</Link>
              </div>
            </FormGroup>
            <h3 className="sub-header">Account Balance</h3>
            <FormGroup className="row" name="abbout-balance">
              <div className="col-sm-2 row-label">
                Account Balance
              </div>
              <div className="col-sm-4" id="balance">
                <strong>{<Currency value={account.balance} />}</strong>
                {account.balance < 0 ? ' (credit)' : null}
              </div>
              <div className="col-sm-6 text-muted">
                {balanceHint}
              </div>
            </FormGroup>
          </Card>
        </section>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  invoices: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    account: state.api.account,
    invoices: state.api.invoices.invoices,
    payments: state.api.payments.payments,
  };
}

export default connect(mapStateToProps)(DashboardPage);
