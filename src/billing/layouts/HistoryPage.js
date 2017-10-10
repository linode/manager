import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';
import { account, invoices } from '~/api';

import { setSource } from '~/actions/source';


export class HistoryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { account, invoices } = this.props;
    const timezone = getStorage('profile/timezone') || 'UTC';

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Billing History" />}>
            <Table
              columns={[
                { dataKey: 'date', formatFn: (date) => {
                  const time = moment.utc(date, moment.iso_8601).tz(timezone);
                  return time.format('MMM D YYYY h:mm A z');
                } },
                {
                  cellComponent: LinkCell,
                  hrefFn: (invoice) => `/billing/invoice/${invoice.id}`, textKey: 'label',
                },
                {
                  dataKey: 'total',
                  className: 'ActionsCell',
                  formatFn: (total) => {
                    return `$${total.toFixed(2)}`;
                  },
                },
              ]}
              noDataMessage="No invoices found."
              data={Object.values(invoices).reverse()}
              disableHeader
            />
            <div className="row">
              <div className="col-sm-12 text-right">
              <strong>Current Balance: ${account.balance}</strong>
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
};

function select(state) {
  return {
    account: state.api.account,
    invoices: state.api.invoices.invoices,
  };
}

export default connect(select)(HistoryPage);
