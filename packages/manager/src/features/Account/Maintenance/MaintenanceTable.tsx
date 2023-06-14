/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import Typography from 'src/components/core/Typography';
import { usePagination } from 'src/hooks/usePagination';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { useOrder } from 'src/hooks/useOrder';
import { MaintenanceTableRow } from './MaintenanceTableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useFormattedDate } from 'src/hooks/useFormattedDate';
import {
  useAccountMaintenanceQuery,
  useAllAccountMaintenanceQuery,
} from 'src/queries/accountMaintenance';

const preferenceKey = 'account-maintenance';

const headersForCSVDownload = [
  { label: 'Entity Label', key: 'entity.label' },
  { label: 'Entity Type', key: 'entity.type' },
  { label: 'Entity ID', key: 'entity.id' },
  { label: 'Date', key: 'when' },
  { label: 'Type', key: 'type' },
  { label: 'Status', key: 'status' },
  { label: 'Reason', key: 'reason' },
];

const useStyles = makeStyles()((theme: Theme) => ({
  cell: {
    width: '12%',
  },
  headingContainer: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(),
      paddingRight: theme.spacing(),
    },
  },
}));

interface Props {
  type: 'pending' | 'completed';
}

const MaintenanceTable = ({ type }: Props) => {
  const csvRef = React.useRef<any>();
  const { classes } = useStyles();
  const pagination = usePagination(1, `${preferenceKey}-${type}`, type);
  const formattedDate = useFormattedDate();

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'status',
      order: 'desc',
    },
    `${preferenceKey}-order-${type}`,
    type
  );

  const filters: Record<'pending' | 'completed', any> = {
    pending: { '+or': ['pending, started'] },
    completed: 'completed',
  };

  const filter = {
    '+order_by': orderBy,
    '+order': order,
    status: filters[type],
  };

  const { data: csv, refetch: getCSVData } = useAllAccountMaintenanceQuery(
    {},
    filter,
    false
  );

  const { data, isLoading, error } = useAccountMaintenanceQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          rows={1}
          columns={7}
          responsive={{
            2: { smDown: true },
            3: { xsDown: true },
            5: { mdDown: true },
          }}
        />
      );
    }

    if (error) {
      return <TableRowError colSpan={7} message={error[0].reason} />;
    }

    if (data?.results === 0) {
      return <TableRowEmpty message={`No ${type} maintenance.`} colSpan={7} />;
    }

    if (data) {
      return data.data.map((item: AccountMaintenance) => (
        <MaintenanceTableRow key={`${item.entity.id}-${item.type}`} {...item} />
      ));
    }

    return null;
  };

  const downloadCSV = async () => {
    await getCSVData();
    csvRef.current.link.click();
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        className={classes.headingContainer}
      >
        <Typography variant="h3" style={{ textTransform: 'capitalize' }}>
          {type}
        </Typography>
        <Box>
          <DownloadCSV
            csvRef={csvRef}
            data={csv || []}
            filename={`${type}-maintenance-${formattedDate}.csv`}
            headers={headersForCSVDownload}
            onClick={downloadCSV}
          />
        </Box>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell}>Entity</TableCell>
            <TableCell className={classes.cell}>Label</TableCell>
            <TableSortCell
              active={orderBy === 'when'}
              direction={order}
              label="when"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Date
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'when'}
                direction={order}
                label="when"
                handleClick={handleOrderChange}
                className={classes.cell}
              >
                When
              </TableSortCell>
            </Hidden>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'type'}
                direction={order}
                label="type"
                handleClick={handleOrderChange}
                className={classes.cell}
              >
                Type
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Status
            </TableSortCell>
            <Hidden lgDown>
              <TableCell style={{ width: '40%' }}>Reason</TableCell>
            </Hidden>
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
    </>
  );
};

export { MaintenanceTable };
