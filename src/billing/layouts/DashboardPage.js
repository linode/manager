import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment-timezone';

import { getStorage } from '~/storage';
import { Card, CardHeader } from 'linode-components/cards';
import { FormGroup } from 'linode-components/forms';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { setSource } from '~/actions/source';


export class DashboardPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { account, invoices } = this.props;
    const timezone = getStorage('profile/timezone') || 'UTC';

    const recentInv = Object.values(invoices).slice(Object.keys(invoices).length - 4);
    const address = [
      account.company,
      `${account.first_name} ${account.last_name}`,
      account.address_1,
      account.address_2,
      account.city && account.state ?
        `${account.city}, ${account.state} ${account.zip ? account.zip : ''}`
        : null,
    ].map((t, i) => (t ? <li key={i}>{t}</li> : null));

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Account Information" />}>
            <h3 className="sub-header">Contact</h3>
            <FormGroup className="row">
              <div className="col-sm-2 row-label">
                Address
              </div>
              <div className="col-sm-10">
                <ul className="list-unstyled" id="address">
                  {address}
                </ul>
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-2 row-label">
                Email
              </div>
              <div className="col-sm-10" id="email">
                {account.email}
              </div>
            </FormGroup>
            <h3 className="sub-header">Recent Billing Activity</h3>
            <FormGroup className="row">
              <div className="col-sm-12">
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
                  data={recentInv.reverse()}
                  disableHeader
                />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-12 text-right">
                <Link to="/billing/history">Billing History</Link>
              </div>
            </FormGroup>
            <h3 className="sub-header">Account Balance</h3>
            <FormGroup className="row">
              <div className="col-sm-2 row-label">
                Account Balance
              </div>
              <div className="col-sm-10" id="balance">
                <strong>${(account.balance)}</strong>
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

function select(state) {
  return {
    account: state.api.account,
    invoices: state.api.invoices.invoices,
  };
}

export default connect(select)(DashboardPage);
