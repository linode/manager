import { SupportTicket } from 'linode-js-sdk/lib/account';
import { compose } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import TicketRow from './TicketRow';
import { getTicketsPage } from './ticketUtils';

interface Props extends PaginationProps<SupportTicket> {
  filterStatus: 'open' | 'closed';
  newTicket?: SupportTicket;
}

type ClassNames =
  | 'root'
  | 'cellSubject'
  | 'cellId'
  | 'cellRegarding'
  | 'cellCreated'
  | 'cellUpdated'
  | 'cellUpdatedBy';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    cellSubject: {
      width: '35%',
      minWidth: 175
    },
    cellId: {
      width: '10%'
    },
    cellRegarding: {
      width: '15%'
    },
    cellCreated: {
      width: '15%',
      minWidth: 175
    },
    cellUpdated: {
      width: '15%',
      minWidth: 175
    },
    cellUpdatedBy: {
      width: '10%',
      minWidth: 120
    }
  });

type CombinedProps = Props &
  Omit<OrderByProps, 'data'> &
  WithStyles<ClassNames>;

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
      return <TableRowLoading colSpan={8} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={8}
          message="We were unable to load your support tickets."
        />
      );
    }

    return tickets && tickets.length > 0 ? (
      this.renderTickets(tickets)
    ) : (
      <TableRowEmptyState colSpan={8} />
    );
  };

  renderTickets = (tickets: SupportTicket[]) =>
    tickets.map((ticket, idx) => {
      return <TicketRow key={`ticket-row-${idx}`} ticket={ticket} />;
    });

  render() {
    const {
      order,
      orderBy,
      handleOrderChange,
      count,
      page,
      pageSize,
      classes
    } = this.props;

    const isActive = (label: string) => label === orderBy;

    return (
      <React.Fragment>
        <Paper
          role="tabpanel"
          aria-labelledby={`tab-${this.props.filterStatus}-tickets`}
          id={`tabpanel-${this.props.filterStatus}-tickets`}
        >
          <Table aria-label="List of Tickets">
            <TableHead>
              <TableRow>
                <TableCell
                  data-qa-support-subject-header
                  className={classes.cellSubject}
                >
                  Subject
                </TableCell>
                <TableCell data-qa-support-id-header className={classes.cellId}>
                  Ticket ID
                </TableCell>
                <TableCell
                  data-qa-support-regarding-header
                  className={classes.cellRegarding}
                >
                  Regarding
                </TableCell>
                <TableSortCell
                  label="opened"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('opened')}
                  data-qa-support-date-header
                  noWrap
                  className={classes.cellCreated}
                >
                  Date Created
                </TableSortCell>
                <TableSortCell
                  label="updated"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('updated')}
                  data-qa-support-updated-header
                  noWrap
                  className={classes.cellUpdated}
                >
                  Last Updated
                </TableSortCell>
                <TableCell
                  data-qa-support-updated-by-header
                  noWrap
                  className={classes.cellUpdatedBy}
                >
                  Updated By
                </TableCell>
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

const styled = withStyles(styles);

const updatedRequest = (ownProps: Props, params: any, filters: any) => {
  return getTicketsPage(params, filters, ownProps.filterStatus).then(
    response => response
  );
};

const paginated = Pagey(updatedRequest);

export default compose(
  paginated,
  styled
)(TicketList);
