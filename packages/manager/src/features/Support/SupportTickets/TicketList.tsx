import * as React from 'react';
import { SupportTicket } from '@linode/api-v4/lib/support';
import Hidden from 'src/components/core/Hidden';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import TicketRow from './TicketRow';
import { useSupportTicketsQuery } from 'src/queries/support';
import { usePagination } from 'src/hooks/usePagination';
import { useOrder } from 'src/hooks/useOrder';
import { getStatusFilter } from './ticketUtils';

export interface Props {
  filterStatus: 'open' | 'closed';
  newTicket?: SupportTicket;
}

const preferenceKey = 'support-tickets';

export const TicketList = (props: Props) => {
  const { filterStatus, newTicket } = props;

  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'opened',
      order: 'desc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data, isLoading, error, refetch } = useSupportTicketsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { ...filter, ...getStatusFilter(filterStatus) }
  );

  React.useEffect(() => {
    refetch();
  }, [newTicket]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          columns={6}
          responsive={{
            1: { smDown: true },
            3: { xsDown: true },
            5: { smDown: true },
          }}
        />
      );
    }

    if (error) {
      return (
        <TableRowError
          colSpan={8}
          message="We were unable to load your support tickets."
        />
      );
    }

    if (data && data.results > 0) {
      return data.data.map((ticket, idx) => (
        <TicketRow key={`ticket-row-${idx}`} ticket={ticket} />
      ));
    }

    return <TableRowEmptyState colSpan={8} />;
  };

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
            </Hidden>
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
        <TableBody>{renderContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        page={pagination.page}
        pageSize={pagination.pageSize}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="ticket list"
        padded
      />
    </>
  );
};

export default TicketList;
