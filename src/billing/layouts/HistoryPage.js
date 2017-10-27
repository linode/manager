import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { BillingHistoryList } from '../components/BillingHistoryList';

import { setSource } from '~/actions/source';


export class HistoryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { account } = this.props;

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Billing History" />}>
            <BillingHistoryList {...this.props} />

            <div className="row">
              <div className="col-sm-12 text-right">
                <strong>Current Balance: ${Math.abs(account.balance).toFixed(2)}
                {account.balance < 0 ? ' (credit)' : null}</strong>
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }
}

HistoryPage.propTypes = {
  dispatch: PropTypes.func,
  account: PropTypes.object.isRequired,
  invoices: PropTypes.object.isRequired,
  payments: PropTypes.object.isRequired,
};

function select(state) {
  return {
    account: state.api.account,
    invoices: state.api.invoices.invoices,
    payments: state.api.payments.payments,
  };
}

export default connect(select)(HistoryPage);
