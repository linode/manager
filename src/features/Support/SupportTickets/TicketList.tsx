import * as moment from 'moment';
import { sort } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getOpenTicketsPage } from 'src/services/support';
import capitalize from 'src/utilities/capitalize';
import { formatString } from 'src/utilities/format-date-iso8601';

interface Props {
  filterStatus: 'open' | 'closed';
}

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  tickets: Linode.SupportTicket[];
  loading: boolean;
}

class TicketList extends React.Component<Props, State> {
  mounted: boolean = false;
  state: State = {
    tickets: [],
    errors: undefined,
    loading: true,
    page: 1,
    count: 0,
    pageSize: 25,
  }

  componentDidMount() {
    this.mounted = true;
    this.getTickets();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  compareTickets = (a:Linode.SupportTicket, b:Linode.SupportTicket) => {
    return moment(b.updated).diff(moment(a.updated));
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

  getSortedTickets = (incoming: Linode.SupportTicket[]) => {
    // Sort by when each ticket was last updated
    return sort(this.compareTickets, incoming);
  }

  getTickets = (page:number = this.state.page, pageSize:number = this.state.pageSize) => {
    const { tickets } = this.state;
    this.setState({ errors: undefined, loading: tickets.length === 0});

    getOpenTicketsPage({ page_size: pageSize, page })
      .then((response) => {
        if (!this.mounted) { return; }
        
        this.setState({
          loading: false,
          tickets: this.getSortedTickets(response.data),
          errors: undefined,
          count: response.results,
          page: response.page,
        });
      })
      .catch((errors) => {
        if (!this.mounted) { return; }
        this.setState({ errors, loading: false, });
      })
  }

  handlePageChange = (page: number) => {
    if (!this.mounted) { return; }
    this.setState({ page }, () => { this.getTickets(page)});
  }

  handlePageSizeChange = (pageSize: number) => {
    if (!this.mounted) { return; }

    this.setState(
      { pageSize },
      () => { this.getTickets(this.state.page, pageSize) },
    );
  }

  renderContent = () => {
    const { tickets, errors, loading } = this.state;

    if (loading) {
      return <TableRowLoading colSpan={12} />
    }

    if (errors) {
      return <TableRowError colSpan={12} message="We were unable to load your support tickets." />
    }

    return tickets && tickets.length > 0 ? this.renderTickets(tickets) : <TableRowEmptyState colSpan={12} />
  };

  renderTickets = (tickets: Linode.SupportTicket[]) => tickets.map(this.renderRow);

  renderEntityLink = (ticket: Linode.SupportTicket) => {
    return ticket.entity
      ? <Link to={this.getLinkTargets(ticket.entity)} >{ticket.entity.label}</Link>
      : null
  }

  renderTopic = (ticket: Linode.SupportTicket) => {
    return ticket.entity
      ? capitalize(ticket.entity.type)
      : null;
  }

  renderRow = (ticket: Linode.SupportTicket) => {
    return (
      <TableRow key={`ticket-${ticket.id}`} >
        <TableCell data-qa-support-id><Link to="/support">{ticket.id}</Link></TableCell>
        <TableCell data-qa-support-topic>{this.renderTopic(ticket)}</TableCell>
        <TableCell data-qa-support-entity>{this.renderEntityLink(ticket)}</TableCell>
        <TableCell data-qa-support-subject>{ticket.summary}</TableCell>
        <TableCell data-qa-support-date><DateTimeDisplay value={ticket.opened} format={formatString} /></TableCell>
        <TableCell data-qa-support-updated><DateTimeDisplay value={ticket.opened} format={formatString} /></TableCell>
        <TableCell />
      </TableRow>
    );
  };

  render() {
    const { count, tickets, page, pageSize, } = this.state;
    
    return (
      <React.Fragment>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell data-qa-support-id-header>Ticket ID</TableCell>
                <TableCell data-qa-support-topic-header>Product</TableCell>
                <TableCell data-qa-support-regarding-header>Regarding</TableCell>
                <TableCell data-qa-support-subject-header style={{ minWidth: 200 }}>Subject</TableCell>
                <TableCell data-qa-support-date-header noWrap>Date Created</TableCell>
                <TableCell data-qa-support-updated-header noWrap>Last Updated</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
          {tickets && tickets.length > 0 &&
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={this.handlePageChange}
              handleSizeChange={this.handlePageSizeChange}
              padded
            />
          }
        </Paper>
      </React.Fragment>
    );
  }
}

export default TicketList;
