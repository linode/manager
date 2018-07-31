import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ErrorState from 'src/components/ErrorState';
// import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import { getOpenTicketsPage } from 'src/services/support';
import capitalize from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/format-date-iso8601';

interface Props {
  filterStatus: 'open' | 'closed';
}

interface State { // extends PaginationProps {
  error?: Linode.ApiFieldError[];
  tickets: Linode.SupportTicket[];
}

class TicketList extends React.Component<Props, State> {
  state = {
    tickets: [],
    error: undefined,
  }

  componentDidMount() {
    this.getTickets();
  }

  getTickets = () => {
    getOpenTicketsPage()
      .then((response) => {
        this.setState({ tickets: response.data.data });
      })
      .catch((error) => {
        this.setState({ error });
      })
  }

  render() {
    const { error, tickets } = this.state;

    /** Error State */
    if (error) {
      return <ErrorState
        errorText="There was an error retrieving your support tickets. Please reload and try again."
      />;
    }

    /** Empty State */
    if (tickets.length === 0) {
      return (
        <React.Fragment>
          <Placeholder
            title="No open tickets"
            copy="There are no open support tickets on your account. Click below to open a new ticket."
            buttonProps={{
              onClick: () => null,
              children: 'Open a Ticket',
            }}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell data-qa-support-id-header>Ticket ID</TableCell>
                <TableCell data-qa-support-topic-header>Product</TableCell>
                <TableCell data-qa-support-regarding-header>Regarding</TableCell>
                <TableCell data-qa-support-subject-header>Subject</TableCell>
                <TableCell data-qa-support-date-header>Date Created</TableCell>
                <TableCell data-qa-support-updated-header>Last Updated</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket: Linode.SupportTicket, idx:number) =>
                <TableRow key={idx} >
                  <TableCell data-qa-support-id-header>{ticket.id}</TableCell>
                  <TableCell data-qa-support-topic-header>{capitalize(ticket.entity.type)}</TableCell>
                  <TableCell data-qa-support-topic-header>{ticket.entity.label}</TableCell>
                  <TableCell data-qa-support-subject-header>{ticket.summary}</TableCell>
                  <TableCell data-qa-support-date-header>{formatDate(ticket.opened, true)}</TableCell>
                  <TableCell data-qa-support-updated-header>{formatDate(ticket.updated, true)}</TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

export default TicketList;
