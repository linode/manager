import { useSupportTicketsQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { TicketRow } from './TicketRow';
import { getStatusFilter, useTicketSeverityCapability } from './ticketUtils';

import type { SupportTicket } from '@linode/api-v4/lib/support';

export interface Props {
  filterStatus: 'closed' | 'open';
  newTicket?: SupportTicket;
}

const preferenceKey = 'support-tickets';

export const TicketList = (props: Props) => {
  const { filterStatus, newTicket } = props;

  const hasSeverityCapability = useTicketSeverityCapability();

  const pagination = usePaginationV2({
    currentRoute:
      filterStatus === 'open'
        ? '/support/tickets/open'
        : '/support/tickets/closed',
    preferenceKey,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'opened',
      },
      from:
        filterStatus === 'open'
          ? '/support/tickets/open'
          : '/support/tickets/closed',
    },
    preferenceKey: `${preferenceKey}-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data, error, isLoading, refetch } = useSupportTicketsQuery(
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
          columns={hasSeverityCapability ? 7 : 6}
          responsive={{
            1: { mdDown: true },
            2: { mdDown: true },
            3: !hasSeverityCapability ? { smDown: true } : { smDown: false },
            4: hasSeverityCapability ? { smDown: true } : { smDown: false },
            5: !hasSeverityCapability ? { mdDown: true } : { mdDown: false },
            6: hasSeverityCapability ? { mdDown: true } : { mdDown: false },
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

    return <TableRowEmpty colSpan={8} />;
  };

  const isActive = (label: string) => label === orderBy;

  return (
    <>
      <Table aria-label="List of Tickets">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={isActive('summary')}
              data-qa-support-subject-header
              direction={order}
              handleClick={handleOrderChange}
              label="summary"
              noWrap
            >
              Subject
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={isActive('id')}
                data-qa-support-id-header
                direction={order}
                handleClick={handleOrderChange}
                label="id"
                noWrap
              >
                Ticket ID
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell data-qa-support-regarding-header>Regarding</TableCell>
            </Hidden>
            {hasSeverityCapability && (
              <TableSortCell
                active={isActive('severity')}
                data-qa-support-severity-header
                direction={order}
                handleClick={handleOrderChange}
                label="severity"
                noWrap
              >
                Severity
              </TableSortCell>
            )}
            <Hidden smDown>
              <TableSortCell
                active={isActive('opened')}
                data-qa-support-date-header
                direction={order}
                handleClick={handleOrderChange}
                label="opened"
                noWrap
              >
                Date Created
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={isActive('updated')}
              data-qa-support-updated-header
              direction={order}
              handleClick={handleOrderChange}
              label="updated"
              noWrap
            >
              Last Updated
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={isActive('updated_by')}
                data-qa-support-updated-by-header
                direction={order}
                handleClick={handleOrderChange}
                label="updated_by"
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
        eventCategory="ticket list"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};
