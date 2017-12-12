import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components';

import { BillingHistoryList } from '../components/BillingHistoryList';
import Currency from '~/components/Currency';
import { setSource } from '~/actions/source';
import { ChainedDocumentTitle } from '~/components';


export class HistoryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { account } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title="History" />
        <section>
          <Card header={<CardHeader title="Billing History" />}>
            <BillingHistoryList {...this.props} />

            <div className="row">
              <div className="col-sm-12 text-right">
                <strong>Current Balance: <Currency value={account.balance} />
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
