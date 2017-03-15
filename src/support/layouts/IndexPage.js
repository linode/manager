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
    // TODO: this can just be {entity} = ticket when entity changes exist in API
    const entity = ticket.entity || {};
    let to = '';

    switch (entity.type) {
      case 'linode':
        to = getLinodeRedirectUrl(entity);
        break;
      case 'nodebalancer':
        to = getNodebalancerRedirectUrl(entity);
        break;
      case 'dnszone':
        to = getDNSZoneRedirectUrl(entity);
        break;
      default:
        break;
    }

    if (to) {
      return <Link to={to}>{entity.label}</Link>;
    }

    return <strong>{entity.label}</strong>;
  }

  renderGroup = ({ group, tickets }) => {
    // TODO: sort in fetch call
    const sortedTickets = _.sortBy(tickets, ({ created }) => moment(created));

    const formatTime = time => moment.utc(time).fromNow();

    const ret = sortedTickets.map((ticket, i) => (
      <tr key={ticket.id} className="PrimaryTable-row">
        <td>
          <div>
            <Link
              className="PrimaryTable-rowLabel"
              to={`/support/${ticket.id}`}
              title={ticket.id}
            >{ticket.summary}</Link>
          </div>
          <div><small>
            Opened
            {!ticket.opened_by ? null : (
              <span>
                &nbsp;by <strong id={`opened-by-${i}`}>{ticket.opened_by}</strong>
              </span>
            )}
            &nbsp;<span id={`opened-${i}`}>{formatTime(ticket.opened)}</span>
            {ticket.entity ? (
              <span>
                &nbsp;regarding <span id={`regarding-${i}`}>{this.renderLink(ticket)}</span>
              </span>
            ) : null}
          </small></div>
        </td>
        <td>#{ticket.id}</td>
        <td>
          {!ticket.updated_by ? <span>No updates</span> : (
            <span>
              Updated by <strong>{ticket.updated_by}</strong> {formatTime(ticket.updated)}
            </span>
          )}
        </td>
        <td></td>
      </tr>
    ));

    if (group) {
      ret.splice(0, 0, (
        <tr className="PrimaryTable-row PrimaryTable-row--groupLabel">
          <td colSpan="3">{group}</td>
        </tr>
      ));
    }

    return ret;
  }

  renderTickets(tickets) {
    const statusFormat = {
      new: 'Open',
      open: 'Open',
      closed: 'Closed',
    };

    const groups = _.map(
      _.sortBy(
        _.map(
          _.groupBy(Object.values(tickets), ({ status }) => statusFormat[status]),
          (_tickets, _group) => ({ group: _group, tickets: _tickets })
        ), ticketGroup => ticketGroup.group
      ).reverse(), this.renderGroup);

    return (
      <table className="PrimaryTable">
        <tbody>
          {groups}
        </tbody>
      </table>
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
