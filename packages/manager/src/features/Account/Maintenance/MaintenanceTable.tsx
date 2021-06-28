/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
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
import usePagination from 'src/hooks/usePagination';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import sync from 'css-animation-sync';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import Link from 'src/components/Link';
import { CSVLink } from 'react-csv';
import { formatDate } from 'src/utilities/formatDate';
import {
  useAccountMaintenanceQuery,
  useAllAccountMaintenanceQuery,
} from 'src/queries/accountMaintenance';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { cleanCSVData } from 'src/components/DownloadCSV/DownloadCSV';
import Typography from 'src/components/core/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { parseAPIDate } from 'src/utilities/date';
import capitalize from 'src/utilities/capitalize';

interface Props {
  // we will add more types when the endpoint supports them
  type: 'Linode';
}

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
  CSVlink: {
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
    color: '#888F91',
    fontSize: '.9rem',
  },
  CSVlinkContainer: {
    marginTop: theme.spacing(0.5),
    '&.MuiGrid-item': {
      paddingRight: 0,
    },
  },
  CSVwrapper: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
  },
  cell: {
    width: '12%',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  heading: {
    marginBottom: theme.spacing(),
  },
}));

const MaintenanceTable: React.FC<Props> = (props) => {
  const { type } = props;
  const csvRef = React.useRef<any>();
  const classes = useStyles();
  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'status',
      order: 'desc',
    },
    preferenceKey + '-order'
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
    // We will want to make queries for each type of entity
    // when this endpoint supports more than Linodes
    // entity: {
    //   type: 'Linode',
    // },
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

  const getStatusIcon = (
    status: 'pending' | 'ready' | 'started' | 'completed'
  ) => {
    switch (status) {
      case 'started':
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
        <TableCell>
          <div>{formatDate(item.when)}</div>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.capitalize}>
            {item.type.replace('_', ' ')}
          </TableCell>
        </Hidden>
        <TableCell>
          <StatusIcon status={getStatusIcon(item.status)} />
          {
            // @ts-expect-error api will change pending -> scheduled
            item.status === 'pending' || item.status === 'scheduled'
              ? 'Scheduled'
              : capitalize(item.status)
          }{' '}
        </TableCell>
        <Hidden smDown>
          <TableCell>{parseAPIDate(item.when).toRelative()}</TableCell>
        </Hidden>
        <Hidden mdDown>
          <TableCell lastChild>{item.reason}</TableCell>
        </Hidden>
      </TableRow>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          oneLine
          numberOfColumns={6}
          colSpan={6}
          widths={[12, 12, 12, 12, 12, 40]}
        />
      );
    } else if (error) {
      return <TableRowError colSpan={6} message={error[0].reason} />;
    } else if (data?.results == 0) {
      return (
        <TableRowEmptyState message="No pending maintenance." colSpan={6} />
      );
    } else if (data) {
      return data.data.map((item: AccountMaintenance) => renderTableRow(item));
    }

    return null;
  };

  const downloadCSV = async () => {
    await getCSVData();
    csvRef.current.link.click();
  };

  React.useEffect(() => {
    sync('pulse');
  }, []);

  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.heading}>
        Linodes
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
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
            <Hidden xsDown>
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
            <Hidden smDown>
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
            <Hidden mdDown>
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
      {data && data.results > 0 ? (
        <Grid container className={classes.CSVwrapper} justify="flex-end">
          <Grid item className={classes.CSVlinkContainer}>
            {/*
              We are using a hidden CSVLink and an <a> to allow us to lazy load the
              entire maintenance list for the CSV download. The <a> is what shows up
              to the user and the onClick fetches the full user data and then
              uses a ref to 'click' the real CSVLink.
              This adds some complexity but gives us the benefit of lazy loading a potentially
              large set of maintenance events on mount for the CSV download.
            */}
            <CSVLink
              ref={csvRef}
              headers={headersForCSVDownload}
              filename={`maintenance-${Date.now()}.csv`}
              data={cleanCSVData(csv || [])}
            />
            <a
              className={`${classes.CSVlink} ${classes.CSVlink}`}
              onClick={downloadCSV}
              aria-hidden="true"
            >
              Download CSV
            </a>
          </Grid>
        </Grid>
      ) : null}
    </React.Fragment>
  );
};

export default MaintenanceTable;
