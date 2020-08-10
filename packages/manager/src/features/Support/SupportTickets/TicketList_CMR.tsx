import { SupportTicket } from '@linode/api-v4/lib/support';
import { compose } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TableRowError from 'src/components/TableRowError/TableRowError_CMR';
import TableRowLoading from 'src/components/TableRowLoading/TableRowLoading_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import TicketRow from './TicketRow_CMR';
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

const styles = () =>
  createStyles({
    root: {}
    // cellSubject: {
    //   width: '35%',
    //   minWidth: 175
    // },
    // cellId: {
    //   width: '10%'
    // },
    // cellRegarding: {
    //   width: '15%'
    // },
    // cellCreated: {
    //   width: '15%',
    //   minWidth: 175
    // },
    // cellUpdated: {
    //   width: '15%',
    //   minWidth: 175
    // },
    // cellUpdatedBy: {
    //   width: '10%',
    //   minWidth: 120
    // }
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

  componentDidUpdate(prevProps: Props) {
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
      <TicketRow key={`ticket-row-${idx}`} ticket={ticket} />;
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
        <Paper>
          <Table aria-label="List of Tickets">
            <TableHead>
              <TableRow>
                <TableSortCell
                  label="summary"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('summary')}
                  data-qa-support-subject-header
                  noWrap
                  className={classes.cellSubject}
                >
                  Subject
                </TableSortCell>
                <TableSortCell
                  label="id"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('id')}
                  data-qa-support-id-header
                  noWrap
                  className={classes.cellId}
                >
                  Ticket ID
                </TableSortCell>
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
                <TableSortCell
                  label="updated_by"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('updated_by')}
                  data-qa-support-updated-by-header
                  noWrap
                  className={classes.cellUpdatedBy}
                >
                  Updated By
                </TableSortCell>
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
  return getTicketsPage(params, filters, ownProps.filterStatus);
};

const paginated = Pagey(updatedRequest);

export default compose(paginated, styled)(TicketList);
