/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table/Table';
import TableCell from 'src/components/TableCell/TableCell';
import TableRow from 'src/components/TableRow/TableRow';
import PaginationFooter from 'src/components/PaginationFooter';
import TableRowError from 'src/components/TableRowError';
import usePagination from 'src/hooks/usePagination';
import TableSortCell from 'src/components/TableSortCell/TableSortCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import Typography from 'src/components/core/Typography';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { CSVLink } from 'react-csv';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { cleanCSVData } from 'src/components/DownloadCSV/DownloadCSV';
import { useOrder } from 'src/hooks/useOrder';
import { MaintenanceTableRow } from './MaintenanceTableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
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

const useStyles = makeStyles((theme: Theme) => ({
  csvLink: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
    color: theme.textColors.tableHeader,
    fontSize: '.9rem',
  },
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

export const MaintenanceTable = ({ type }: Props) => {
  const csvRef = React.useRef<any>();
  const classes = useStyles();
  const pagination = usePagination(1, `${preferenceKey}-${type}`);

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
      return (
        <TableRowEmptyState message={`No ${type} maintenance.`} colSpan={7} />
      );
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
        {/*
            We are using a hidden CSVLink and an <a> to allow us to lazy load the
            entire maintenance list for the CSV download. The <a> is what shows up
            to the user and the onClick fetches the full user data and then
            uses a ref to 'click' the real CSVLink.
            This adds some complexity but gives us the benefit of lazy loading a potentially
            large set of maintenance events on mount for the CSV download.
          */}
        <Box>
          <CSVLink
            ref={csvRef}
            headers={headersForCSVDownload}
            filename={`${type}-maintenance-${Date.now()}.csv`}
            data={cleanCSVData(csv || [])}
          />
          <a
            className={classes.csvLink}
            onClick={downloadCSV}
            aria-hidden="true"
          >
            Download CSV
          </a>
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
