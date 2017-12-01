import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';
import { ChainedDocumentTitle } from '~/components';
import { Card, CardHeader } from 'linode-components/cards';
import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import Currency from '~/components/Currency';
import { setSource } from '~/actions/source';


export class PaymentPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { payment } = this.props;
    const timezone = getStorage('profile/timezone') || 'UTC';

    return (
      <div>
        <ChainedDocumentTitle title={`Payment #${payment.id}`} />
        <Breadcrumbs
          crumbs={[
            { label: 'History', to: '/billing/history' },
            { label: `Payment #${payment.id}` },
          ]}
        />

        <section>
          <Card header={<CardHeader title={`Payment #${payment.id}`} />}>
            <Table
              columns={[
                {
                  dataKey: 'id',
                  label: 'Description',
                  formatFn: (paymentId) => {
                    return `Payment #${paymentId}. Thank you.`;
                  },
                },
                {
                  dataKey: 'date',
                  label: 'From',
                  headerClassName: 'DateColumn',
                  formatFn: (from) => {
                    if (!from) {
                      return;
                    }
                    const time = moment.utc(from, moment.iso_8601).tz(timezone);
                    return time.format('MMM D YYYY h:mm A z');
                  },
                },
                {
                  dataKey: 'usd',
                  label: 'Amount',
                  headerClassName: 'IntegerColumn text-right',
                  className: 'text-right',
                  formatFn: (usd) => {
                    return <Currency value={usd} />;
                  },
                },
              ]}
              noDataMessage="No Payments found."
              data={Object.values([payment])}
            />
            <div className="row">
              <div className="col-sm-12 text-right">
                <strong>Payment Total: {<Currency value={payment.usd} />}</strong>
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }
}

PaymentPage.propTypes = {
  dispatch: PropTypes.func,
  payment: PropTypes.object.isRequired,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const paymentId = params.paymentId;
  const payment = state.api.payments.payments[paymentId];

  return {
    payment,
  };
}

export default connect(select)(PaymentPage);
