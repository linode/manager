import { SupportTicket } from '@linode/api-v4/lib/support';
import * as React from 'react';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
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

interface Props {
  filterStatus: 'open' | 'closed';
  newTicket?: SupportTicket;
}

export type CombinedProps = Props &
  PaginationProps<SupportTicket> &
  Omit<OrderByProps, 'data'>;

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
    } = this.props;

    const isActive = (label: string) => label === orderBy;

    return (
      <>
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
              >
                Subject
              </TableSortCell>
              <Hidden smDown>
                <TableSortCell
                  label="id"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('id')}
                  data-qa-support-id-header
                  noWrap
                >
                  Ticket ID
                </TableSortCell>
              </Hidden>
              <TableCell data-qa-support-regarding-header>Regarding</TableCell>
              <Hidden xsDown>
                <TableSortCell
                  label="opened"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('opened')}
                  data-qa-support-date-header
                  noWrap
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
                >
                  Last Updated
                </TableSortCell>
              </Hidden>
              <Hidden smDown>
                <TableSortCell
                  label="updated_by"
                  direction={order}
                  handleClick={handleOrderChange}
                  active={isActive('updated_by')}
                  data-qa-support-updated-by-header
                  noWrap
                >
                  Updated By
                </TableSortCell>
              </Hidden>
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
      </>
    );
  }
}

const updatedRequest = (ownProps: Props, params: any, filters: any) => {
  return getTicketsPage(params, filters, ownProps.filterStatus);
};

const paginated = Pagey(updatedRequest);

export default compose<CombinedProps, Props>(paginated)(TicketList);
