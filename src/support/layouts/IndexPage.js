import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { tickets } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import CreateHelper from '~/components/CreateHelper';
import {
  getLinodeRedirectUrl, getNodebalancerRedirectUrl, getDNSZoneRedirectUrl,
} from '~/components/notifications/EventTypes';
import { Table } from '~/components/tables';
import {
  TableCell,
} from '~/components/tables/cells';

const TICKET_LINK_MAP = {
  linode: getLinodeRedirectUrl,
  nodebalancer: getNodebalancerRedirectUrl,
  dnszone: getDNSZoneRedirectUrl,
};

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(tickets.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Support'));
  }

  renderLink(ticket) {
    const { entity } = ticket;
    const to = TICKET_LINK_MAP[entity.type];

    if (to) {
      return <Link to={to}>{entity.label}</Link>;
    }

    return <strong>{entity.label}</strong>;
  }

  renderLabelCell = ({ record: ticket }) => {
    return (
      <TableCell column={{ className: 'RowLabelCell' }} record={ticket}>
        <Link title={ticket.id} to={`/support/${ticket.id}`}>{ticket.summary}</Link>
        <small>
          Opened
          {!ticket.opened_by ? null : (
            <span>
              &nbsp;by <strong id={`opened-by-${ticket.id}`}>{ticket.opened_by}</strong>
            </span>
          )}
          &nbsp;<span id={`opened-${ticket.id}`}>{moment.utc(ticket.opened).fromNow()}</span>
          {ticket.entity ? (
            <span>
              &nbsp;regarding <span id={`regarding-${ticket.id}`}>{this.renderLink(ticket)}</span>
            </span>
           ) : null}
        </small>
      </TableCell>
    );
  }

  renderUpdatedByCell({ record: ticket }) {
    return (
      <TableCell column={{}} record={ticket}>
        {!ticket.updated_by ? <span>No updates</span> : (
          <span>
            Updated by <strong>{ticket.updated_by}</strong> {moment.utc(ticket.updated).fromNow()}
          </span>
        )}
      </TableCell>
    );
  }

  renderTickets(tickets) {
    const statusFormat = {
      new: 'Open',
      open: 'Open',
      closed: 'Closed',
    };

    const groups = _.sortBy(
      _.map(
        _.groupBy(Object.values(tickets), ({ status }) => statusFormat[status]),
        (_tickets, _group) => ({
          name: _group,
          columns: [
            {
              cellComponent: this.renderLabelCell,
            },
            {
              dataKey: 'id',
              formatFn: id => <span>#{id}</span>,
            },
            {
              cellComponent: this.renderUpdatedByCell,
            },
          ],
          data: _tickets,
        })));

    return (
      <div>
        {groups.map(function (group, index) {
          return (
            <div className="Group" key={index}>
              <div className="Group-label">{group.name}</div>
              <Table
                className="Tickets"
                columns={group.columns}
                data={group.data}
              />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { tickets } = this.props;

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Support</h1>
            <Link to="/support/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Open a ticket
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(tickets.tickets).length ? this.renderTickets(tickets.tickets) :
            <CreateHelper label="tickets" href="/support/create" linkText="Open a ticket" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tickets: PropTypes.object.isRequired,
};


function select(state) {
  return {
    tickets: state.api.tickets,
  };
}

export default connect(select)(IndexPage);
