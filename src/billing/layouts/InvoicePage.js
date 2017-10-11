import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';
import { objectFromMapByLabel } from '~/api/util';
import { invoices } from '~/api';

import { setSource } from '~/actions/source';


export class InvoicePage extends Component {
  static async preload({ dispatch, getState }, { invoiceId }) {
    await dispatch(invoices.items.one([invoiceId]));
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
                    if(!from) {
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
                    if(!to) {
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
                    if(!unitPrice) {
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
                    return `$${amount.toFixed(2)}`;
                  },
                },
              ]}
              noDataMessage="No items found."
              data={items}
            />
            <div className="row">
              <div className="col-sm-12 text-right">
              <strong>Invoice Total: ${invoice.total.toFixed(2)}</strong>
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
};

function select(state, ownProps) {
  const params = ownProps.params;
  const invoiceId = params.invoiceId;
  const invoice = state.api.invoices.invoices[invoiceId];
  const items = invoice._items.data;
  return {
    invoice,
    items,
  };
}

export default connect(select)(InvoicePage);
