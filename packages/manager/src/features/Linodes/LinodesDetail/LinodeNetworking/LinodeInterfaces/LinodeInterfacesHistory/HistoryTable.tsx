import { useLinodeInterfacesHistory } from '@linode/queries';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

import { HistoryTableContent } from './HistoryTableContent';

const preferenceKey = 'linode-interface-history';

interface Props {
  linodeId: number;
  open: boolean;
}

export const HistoryTable = (props: Props) => {
  const { linodeId, open } = props;

  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );
  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: interfaceHistory,
    error,
    isPending,
  } = useLinodeInterfacesHistory(
    linodeId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter,
    open
  );

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              handleClick={handleOrderChange}
              label={'created'}
            >
              Created
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'interface_id'}
              direction={order}
              handleClick={handleOrderChange}
              label={'interface_id'}
            >
              Interface ID
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'linode_id'}
              direction={order}
              handleClick={handleOrderChange}
              label={'linode_id'}
            >
              Linode ID
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'event_id'}
              direction={order}
              handleClick={handleOrderChange}
              label={'event_id'}
            >
              Event ID
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'version'}
              direction={order}
              handleClick={handleOrderChange}
              label={'version'}
            >
              Version
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label={'status'}
            >
              Status
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <HistoryTableContent
            data={interfaceHistory?.data}
            error={error}
            isPending={isPending}
          />
        </TableBody>
      </Table>
      <PaginationFooter
        count={interfaceHistory?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};
