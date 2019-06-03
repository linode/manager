import { WithStyles } from '@material-ui/core/styles';
import { compose } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TicketRow from './TicketRow';
import { getTicketsPage } from './ticketUtils';

interface Props extends PaginationProps<Linode.SupportTicket> {
  filterStatus: 'open' | 'closed';
  newTicket?: Linode.SupportTicket;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

type ClassNames = 'root';

type CombinedProps = Props & WithStyles<ClassNames>;

export class TicketList extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.request();
  }

  componentDidUpdate(prevProps: Props, prevState: {}) {
    if (prevProps.filterStatus !== this.props.filterStatus) {
      this.props.handlePageChange(1);
    }
    if (prevProps.newTicket !== this.props.newTicket) {
      this.props.request();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  renderContent = () => {
    const { data: tickets, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={12} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={6}
          message="We were unable to load your support tickets."
        />
      );
    }

    return tickets && tickets.length > 0 ? (
      this.renderTickets(tickets)
    ) : (
      <TableRowEmptyState colSpan={6} />
    );
  };

  renderTickets = (tickets: Linode.SupportTicket[]) =>
    tickets.map((ticket, idx) => (
      <TicketRow key={`ticket-row-${idx}`} ticket={ticket} />
    ));

  render() {
    const { count, page, pageSize } = this.props;

    return (
      <React.Fragment>
        <Paper>
          <Table aria-label="List of Tickets">
            <TableHead>
              <TableRow>
                <TableCell
                  data-qa-support-subject-header
                  style={{ minWidth: 200 }}
                >
                  Subject
                </TableCell>
                <TableCell data-qa-support-id-header>Ticket ID</TableCell>
                <TableCell data-qa-support-regarding-header>
                  Regarding
                </TableCell>
                <TableCell data-qa-support-date-header noWrap>
                  Date Created
                </TableCell>
                <TableCell data-qa-support-updated-header noWrap>
                  Last Updated
                </TableCell>
                <TableCell data-qa-support-updated-header noWrap>
                  Updated By
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.props.handlePageChange}
            handleSizeChange={this.props.handlePageSizeChange}
            eventCategory="ticket list"
            padded
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const updatedRequest = (ownProps: Props, params: any, filters: any) => {
  return getTicketsPage(params, filters, ownProps.filterStatus).then(
    response => response
  );
};

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles);

export default compose(
  paginated,
  styled
)(TicketList);
