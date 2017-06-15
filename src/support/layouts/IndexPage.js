import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { TableCell } from 'linode-components/tables/cells';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { tickets } from '~/api';
import CreateHelper from '~/components/CreateHelper';
import {
  getLinodeRedirectUrl, getNodebalancerRedirectUrl, getDomainRedirectUrl,
} from '~/components/notifications/EventTypes';
import TimeDisplay from '~/components/TimeDisplay';


const TICKET_LINK_MAP = {
  linode: getLinodeRedirectUrl,
  nodebalancer: getNodebalancerRedirectUrl,
  domain: getDomainRedirectUrl,
};

export function renderTicketCreationInfo(ticket) {
  const entity = ticket.entity || {};
  const to = TICKET_LINK_MAP[entity.type];

  let link = <strong>{entity.label}</strong>;
  if (to) {
    link = <Link to={to(entity)}>{entity.label}</Link>;
  }

  return (
    <div>
      Opened
      {!ticket.opened_by ? null : (
        <span>
          &nbsp;by <strong id={`opened-by-${ticket.id}`}>{ticket.opened_by}</strong>
        </span>
      )}
      &nbsp;<span id={`opened-${ticket.id}`}><TimeDisplay time={ticket.opened} /></span>
      {ticket.entity ? (
        <span>
          &nbsp;regarding <span id={`regarding-${ticket.id}`}>{link}</span>
        </span>
      ) : null}
    </div>
  );
}

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(tickets.all());
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Support'));
  }

  renderLabelCell = ({ record: ticket }) => {
    return (
      <TableCell
        column={{ className: 'LabelCell', headerClassName: 'TicketLabelColumn' }}
        record={ticket}
      >
        <Link title={ticket.id} to={`/support/${ticket.id}`}>{ticket.summary}</Link>
        <small>{renderTicketCreationInfo(ticket)}</small>
      </TableCell>
    );
  }

  renderUpdatedByCell({ record: ticket }) {
    return (
      <TableCell column={{}} record={ticket}>
        {!ticket.updated_by ? <span>No updates</span> : (
          <span>
            Updated by <strong id={`updated-by-${ticket.id}`}>{ticket.updated_by}</strong>
            &nbsp;<span id={`updated-${ticket.id}`}><TimeDisplay time={ticket.updated} /></span>
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

    const groups = _.map(
      _.groupBy(
        _.sortBy(Object.values(tickets), ticket => new Date(ticket.created)).reverse(),
        ({ status }) => statusFormat[status]),
      (_tickets, _group) => ({
        name: _group,
        columns: [
          {
            cellComponent: this.renderLabelCell,
            headerClassName: 'TicketLabelColumn',
          },
          {
            dataKey: 'id',
            className: 'hidden-md-down',
            headerClassName: 'TicketIdColumn hidden-md-down',
            formatFn: id => <span>Ticket #{id}</span>,
          },
          {
            cellComponent: this.renderUpdatedByCell,
          },
        ],
        data: _tickets,
      }));

    if (groups[0].name !== 'Open') {
      groups.unshift({ name: 'Open', data: [] });
    }

    return (
      <List>
        <ListBody>
          {groups.map((group, index) => {
            return (
              <ListGroup
                key={index}
                name={group.name}
              >
                <Table
                  className="Tickets"
                  columns={group.columns}
                  data={group.data}
                  selectedMap={{}}
                  noDataMessage="You have no open tickets."
                  disableHeader
                />
              </ListGroup>
            );
          })}
        </ListBody>
      </List>
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
