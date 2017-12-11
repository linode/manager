import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';

import { Card, CardHeader } from 'linode-components/cards';
import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import Currency from '~/components/Currency';
import api from '~/api';
import { setSource } from '~/actions/source';

import { ChainedDocumentTitle } from '~/components';
import { getStorage } from '~/storage';


export class InvoicePage extends Component {
  static async preload({ dispatch, getState }, { invoiceId }) {
    await dispatch(api.invoices.items.all([invoiceId]));
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { invoice, items } = this.props;
    const timezone = getStorage('profile/timezone') || 'UTC';

    return (
      <div>
        <ChainedDocumentTitle title={`Invoice #${invoice.id}`} />
        <Breadcrumbs
          crumbs={[
            { label: 'History', to: '/billing/history' },
            { label: `Invoice #${invoice.id}` },
          ]}
        />

        <section>
          <Card header={<CardHeader title={`Invoice #${invoice.id}`} />}>
            <Table
              columns={[
                { dataKey: 'label', label: 'Description' },
                {
                  dataKey: 'from',
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
                  dataKey: 'to',
                  label: 'To',
                  headerClassName: 'DateColumn',
                  formatFn: (to) => {
                    if (!to) {
                      return;
                    }
                    const time = moment.utc(to, moment.iso_8601).tz(timezone);
                    return time.format('MMM D YYYY h:mm A z');
                  },
                },
                {
                  dataKey: 'quantity',
                  label: 'Quantity',
                  headerClassName: 'IntegerColumn text-right',
                  className: 'text-right',
                },
                {
                  dataKey: 'unit_price',
                  label: 'Unit Price',
                  headerClassName: 'IntegerColumn text-right',
                  className: 'text-right',
                  formatFn: (unitPrice) => {
                    if (!unitPrice) {
                      return;
                    }
                    return `$${parseFloat(unitPrice).toFixed(4)}`;
                  },
                },
                {
                  dataKey: 'amount',
                  label: 'Amount',
                  headerClassName: 'IntegerColumn text-right',
                  className: 'text-right',
                  formatFn: (amount) => {
                    return <Currency value={amount} />;
                  },
                },
              ]}
              noDataMessage="No items found."
              data={Object.values(items)}
            />
            <div className="row">
              <div className="col-sm-12 text-right">
                <strong>Invoice Total: <Currency value={invoice.total} /></strong>
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }
}

InvoicePage.propTypes = {
  dispatch: PropTypes.func,
  invoice: PropTypes.object.isRequired,
  items: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const invoiceId = params.invoiceId;
  const invoice = state.api.invoices.invoices[invoiceId];
  const items = invoice._items.items;

  return {
    invoice,
    items,
  };
}

export default connect(select)(InvoicePage);
