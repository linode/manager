import { useLinodeInterfacesHistory } from '@linode/queries';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { HistoryTableContent } from './HistoryTableContent';

const preferenceKey = 'linode-interface-history';

interface Props {
  linodeId: number;
}

export const HistoryTable = (props: Props) => {
  const { linodeId } = props;

  const pagination = usePaginationV2({
    currentRoute: '/linodes/$linodeId/networking/history',
    preferenceKey: `${preferenceKey}`,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'interface_id',
      },
      from: '/linodes/$linodeId/networking/history',
    },
    preferenceKey: `${preferenceKey}-order`,
    prefix: preferenceKey,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: interfaceHistory,
    error,
    isLoading,
  } = useLinodeInterfacesHistory(
    linodeId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Created</TableCell>
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
              active={orderBy === 'version'}
              direction={order}
              handleClick={handleOrderChange}
              label={'version'}
            >
              Version
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <HistoryTableContent
            data={interfaceHistory?.data}
            error={error}
            isLoading={isLoading}
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
