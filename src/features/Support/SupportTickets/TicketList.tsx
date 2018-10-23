import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ISO_FORMAT } from 'src/constants';

import { getTicketsPage } from './ticketUtils';

interface Props extends PaginationProps<Linode.SupportTicket> {
  filterStatus: 'open' | 'closed';
  newTicket?: Linode.SupportTicket;
}

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

type ClassNames = 'root';

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketList extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.request();
  }

  componentDidUpdate(prevProps: Props, prevState: {}) {
    if (prevProps.filterStatus !== this.props.filterStatus) {
      this.props.handlePageChange(1)
    }
    if (prevProps.newTicket !== this.props.newTicket) {
      this.props.request();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getLinkTargets = (entity:any) => {
    switch (entity.type) {
      case 'linode':
        return `/linodes/${entity.id}`;
      case 'domain':
        return `/domains/${entity.id}`;
      case 'nodebalancer':
        return `/nodebalancers/${entity.id}`;
      case 'longview':
        return '/longview';
      case 'volume':
        return '/volumes';
      default:
        return '';
    }
  }

  renderContent = () => {
    const { data: tickets, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={12} />
    }

    if (error) {
      return <TableRowError colSpan={6} message="We were unable to load your support tickets." />
    }
    
    return tickets && tickets.length > 0 ? this.renderTickets(tickets) : <TableRowEmptyState colSpan={6} />
  };

  renderTickets = (tickets: Linode.SupportTicket[]) => tickets.map(this.renderRow);

  renderEntityLink = (ticket: Linode.SupportTicket) => {
    return ticket.entity
      ? <Link to={this.getLinkTargets(ticket.entity)} className="secondaryLink">{ticket.entity.label}</Link>
      : null
  }

  renderRow = (ticket: Linode.SupportTicket) => {
    return (
      <TableRow data-qa-support-ticket={ticket.id} key={`ticket-${ticket.id}`} rowLink={`/support/tickets/${ticket.id}`}>
        <TableCell parentColumn="Subject" data-qa-support-subject><Link to={`/support/tickets/${ticket.id}`}>{ticket.summary}</Link></TableCell>
        <TableCell parentColumn="Ticket ID" data-qa-support-id>{ticket.id}</TableCell>
        <TableCell parentColumn="Regarding" data-qa-support-entity>{this.renderEntityLink(ticket)}</TableCell>
        <TableCell parentColumn="Date Created" data-qa-support-date><DateTimeDisplay value={ticket.opened} format={ISO_FORMAT} /></TableCell>
        <TableCell parentColumn="Last Updated" data-qa-support-updated><DateTimeDisplay value={ticket.updated} format={ISO_FORMAT} /></TableCell>
        <TableCell />
      </TableRow>
    );
  };

  render() {
    const { count, page, pageSize, } = this.props;

    return (
      <React.Fragment>
        <Paper>
          <Table aria-label="List of Tickets">
            <TableHead>
              <TableRow>
                <TableCell data-qa-support-subject-header style={{ minWidth: 200 }}>Subject</TableCell>
                <TableCell data-qa-support-id-header>Ticket ID</TableCell>
                <TableCell data-qa-support-regarding-header>Regarding</TableCell>
                <TableCell data-qa-support-date-header noWrap>Date Created</TableCell>
                <TableCell data-qa-support-updated-header noWrap>Last Updated</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.props.handlePageChange}
            handleSizeChange={this.props.handlePageSizeChange}
            padded
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const updatedRequest = (ownProps: Props, params: any, filters: any) => {
  return {
    request: () => getTicketsPage(params, filters, ownProps.filterStatus)
      .then(response => response),
    cancel: null,
  }
}

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles, { withTheme: true });

export default compose(
  paginated,
  styled
)(TicketList)
