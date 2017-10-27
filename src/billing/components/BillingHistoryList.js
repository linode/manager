import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

export const BillingHistoryList = props => {
  const {
      invoices,
      payments,
  } = props;

  const dateSort = (a, b) => new Date(a.date) - new Date(b.date);
  const dateSince = (since) => ({ date }) => new Date(date) > since;

  const timezone = getStorage('profile/timezone') || 'UTC';
  let history = [
    ..._.map(invoices, invoice => ({ ...invoice, type: 'invoice' })),
    ..._.map(payments, payment => ({
      ...payment,
      type: 'payment',
      total: -payment.usd,
      label: `Payment - #${payment.id}`,
    })),
  ];

  history.sort(dateSort);

  if (props.days) {
    const since = new Date();
    since.setDate(since.getDate() - props.days);

    history = history.filter(dateSince(since));
  }

  return (
    <Table
      columns={[
        {
          dataKey: 'date',
          formatFn: (date) => {
            const time = moment.utc(date, moment.iso_8601).tz(timezone);
            return time.format('MMM D YYYY h:mm A z');
          },
        },
        {
          cellComponent: LinkCell,
          hrefFn: (item) => `/billing/history/${item.type}/${item.id}`,
          textKey: 'label',
        },
        {
          dataKey: 'total',
          className: 'ActionsCell',
          formatFn: (total) => {
            return total < 0 ? `($${(-total).toFixed(2)})` : `$${total.toFixed(2)}`;
          },
        },
      ]}
      noDataMessage="No history found."
      data={Object.values(history).reverse()}
      disableHeader
    />
  );
};

BillingHistoryList.propTypes = {
  dispatch: PropTypes.func,
  invoices: PropTypes.object.isRequired,
  payments: PropTypes.object.isRequired,
  days: PropTypes.number,
};

function select(state) {
  return {
    invoices: state.api.invoices.invoices,
    payments: state.api.payments.payments,
  };
}

export default connect(select)(BillingHistoryList);
