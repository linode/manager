import * as React from 'react';
import { useState, useEffect } from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { useAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import PaginationFooter from 'src/components/PaginationFooter';
import TableRowLoading from 'src/components/TableRowLoading';
import TableRowError from 'src/components/TableRowError';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import StatusIcon from 'src/components/StatusIcon';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import capitalize from 'src/utilities/capitalize';
import usePagination from 'src/hooks/usePagination';
import TableSortCell from 'src/components/TableSortCell';
import sync from 'css-animation-sync';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

export default function MaintenanceTable() {
  const pagination = usePagination(1);
  const [orderBy, setOrderBy] = useState('status');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading, error, refetch } = useAccountMaintenanceQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      ['+order_by']: orderBy,
      ['+order']: order,
      // We will want to make queries for each type of entity
      // when this endpoint supports more than Linodes
      // entity: {
      //   type: 'Linode',
      // },
    }
  );

  const getStatusIcon = (
    status: 'pending' | 'ready' | 'started' | 'completed'
  ) => {
    switch (status) {
      case 'started':
      case 'pending':
        return 'other';
      case 'completed':
        return 'active';
      default:
        return 'inactive';
    }
  };

  const renderTableRow = (item: AccountMaintenance) => {
    return (
      <TableRow
        rowLink={`/${item.entity.type}s/${item.entity.id}`}
        key={item.entity.id}
      >
        <TableCell parentColumn="Label">{item.entity.label}</TableCell>
        <TableCell parentColumn="Date">{item.when}</TableCell>
        <TableCell parentColumn="Type">{item.type}</TableCell>
        <TableCell parentColumn="Status">
          <StatusIcon status={getStatusIcon(item.status)} />
          {capitalize(item.status)}
        </TableCell>
        <TableCell parentColumn="Reason">{item.reason}</TableCell>
      </TableRow>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          numberOfRows={pagination.pageSize - 10}
          numberOfColumns={5}
          colSpan={5}
          widths={[15, 15, 15, 15, 40]}
          compact
        />
      );
    } else if (error) {
      return <TableRowError colSpan={5} message={error[0].reason} />;
    } else if (data?.results == 0) {
      return <TableRowEmptyState colSpan={5} />;
    } else if (data) {
      return data.data.map((item: AccountMaintenance) => renderTableRow(item));
    }

    return null;
  };

  const handleOrderChange = (key: string, order: 'asc' | 'desc') => {
    setOrderBy(key);
    setOrder(order);
  };

  useEffect(() => {
    refetch();
  }, [order, orderBy]);

  React.useEffect(() => {
    sync('pulse');
  }, []);

  return (
    <>
      <DocumentTitleSegment segment="Maintenance" />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '15%' }}>Label</TableCell>
            <TableCell style={{ width: '15%' }}>Date</TableCell>
            <TableSortCell
              active={orderBy === 'type'}
              direction={order}
              label="type"
              handleClick={handleOrderChange}
              style={{ width: '15%' }}
            >
              Type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
              style={{ width: '15%' }}
            >
              Status
            </TableSortCell>
            <TableCell style={{ width: '40%' }}>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      {data && data.results > 1 ? (
        <PaginationFooter
          count={data?.results || 0}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          eventCategory="Maintenance Table"
        />
      ) : null}
    </>
  );
}
