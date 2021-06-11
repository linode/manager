import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import PaginationFooter from 'src/components/PaginationFooter';
import TableRowLoading from 'src/components/TableRowLoading';
import TableRowError from 'src/components/TableRowError';
import StatusIcon from 'src/components/StatusIcon';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import capitalize from 'src/utilities/capitalize';
import usePagination from 'src/hooks/usePagination';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import sync from 'css-animation-sync';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import Link from 'src/components/Link';
import CSVLink from 'src/components/DownloadCSV';
import formatDate from 'src/utilities/formatDate';
import { DateTime } from 'luxon';
import {
  useAccountMaintenanceQuery,
  useAllAccountMaintenanceQuery,
} from 'src/queries/accountMaintenance';

interface Props {
  // we will add more types when the endpoint supports then
  type: 'Linode';
}

const headers = [
  { label: 'label', key: 'entity.label' },
  { label: 'id', key: 'entity.id' },
  { label: 'type', key: 'entity.type' },
  { label: 'url', key: 'entity.url' },
  { label: 'when', key: 'when' },
  { label: 'reason', key: 'reason' },
  { label: 'status', key: 'status' },
  { label: 'type', key: 'type' },
];

const MaintenanceTable: React.FC<Props> = (props) => {
  const { type } = props;
  const pagination = usePagination(1);
  const [orderBy, setOrderBy] = React.useState('status');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

  const { data: csv } = useAllAccountMaintenanceQuery();
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
      <TableRow key={item.entity.id}>
        <TableCell>
          <Link to={`/${item.entity.type}s/${item.entity.id}`} tabIndex={0}>
            {item.entity.label}
          </Link>
        </TableCell>
        <TableCell>{item.when}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>
          <StatusIcon status={getStatusIcon(item.status)} />
          {capitalize(item.status)}
        </TableCell>
        <TableCell>{item.reason}</TableCell>
      </TableRow>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          oneLine
          numberOfColumns={5}
          colSpan={5}
          widths={[15, 15, 15, 15, 40]}
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

  React.useEffect(() => {
    refetch();
  }, [order, orderBy]);

  React.useEffect(() => {
    sync('pulse');
  }, []);

  return (
    <React.Fragment>
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
      <PaginationFooter
        count={data?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory={`${type} Maintenance Table`}
      />
      <CSVLink
        className={''}
        headers={headers}
        filename={`maintenance-${formatDate(DateTime.local().toISO())}.csv`}
        data={csv || []}
      >
        Download CSV
      </CSVLink>
    </React.Fragment>
  );
};

export default MaintenanceTable;
