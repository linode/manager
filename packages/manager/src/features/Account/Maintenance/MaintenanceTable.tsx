import {
  useAccountMaintenanceQuery,
  useAllAccountMaintenanceQuery,
} from '@linode/queries';
import { Box, Paper, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useFormattedDate } from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
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
import { useFlags } from 'src/hooks/useFlags';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { MaintenanceTableRow } from './MaintenanceTableRow';
import {
  COMPLETED_MAINTENANCE_FILTER,
  IN_PROGRESS_MAINTENANCE_FILTER,
  maintenanceDateColumnMap,
  PENDING_MAINTENANCE_FILTER,
  SCHEDULED_MAINTENANCE_FILTER,
} from './utilities';

import type { AccountMaintenance, Filter } from '@linode/api-v4';

const preferenceKey = 'account-maintenance';

const headersForCSVDownload = [
  { key: 'entity.label', label: 'Entity Label' },
  { key: 'entity.type', label: 'Entity Type' },
  { key: 'entity.id', label: 'Entity ID' },
  { key: 'when', label: 'Date' },
  { key: 'not_before', label: 'Not Before' },
  { key: 'start_time', label: 'Start Date' },
  { key: 'complete_time', label: 'End Date' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
];

const useStyles = makeStyles()(() => ({
  cell: {
    width: '10%',
  },
}));

export type MaintenanceTableType =
  | 'completed'
  | 'in progress'
  | 'pending' // TODO VM & Host Maintenance: Remove pending type after GA
  | 'scheduled';

interface Props {
  type: MaintenanceTableType;
}

export const MaintenanceTable = ({ type }: Props) => {
  const csvRef = React.useRef<any>(undefined);
  const { classes } = useStyles();
  const formattedDate = useFormattedDate();
  const flags = useFlags();

  const pagination = usePaginationV2({
    currentRoute: `/account/maintenance`,
    preferenceKey: `${preferenceKey}-${type}`,
    queryParamsPrefix: type,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'status',
      },
      from: `/account/maintenance`,
    },
    preferenceKey: `${preferenceKey}-order-${type}`,
    prefix: type,
  });

  /**
   * We use a different API filter depending on the table's `type`
   */
  const filters: Record<Props['type'], Filter> = {
    completed: COMPLETED_MAINTENANCE_FILTER,
    'in progress': IN_PROGRESS_MAINTENANCE_FILTER,
    scheduled: SCHEDULED_MAINTENANCE_FILTER,
    pending: PENDING_MAINTENANCE_FILTER,
  };

  const filter: Filter = {
    '+order': order,
    '+order_by': orderBy,
    ...filters[type],
  };

  const { data: csv, refetch: getCSVData } = useAllAccountMaintenanceQuery(
    {},
    filter,
    false
  );

  const { data, error, isLoading } = useAccountMaintenanceQuery(
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
          columns={7}
          responsive={{
            2: { smDown: true },
            3: { xsDown: true },
            5: { mdDown: true },
          }}
          rows={1}
        />
      );
    }

    if (error) {
      return <TableRowError colSpan={7} message={error[0].reason} />;
    }

    if (data?.results === 0) {
      return <TableRowEmpty colSpan={7} message={`No ${type} maintenance.`} />;
    }

    if (data) {
      return data.data.map((item: AccountMaintenance) => (
        <MaintenanceTableRow
          key={`${item.entity.id}-${item.type}`}
          maintenance={item}
          tableType={type}
        />
      ));
    }

    return null;
  };

  const downloadCSV = async () => {
    await getCSVData();
    // This approach is not particularly elegant, but setTimeout may be the best way to make this click async without adding a lot of logic.
    setTimeout(() => {
      csvRef.current.link.click();
    }, 0);
  };

  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          minHeight: '42px',
          padding: 0.75,
          paddingLeft: 2,
        }}
      >
        <Typography style={{ textTransform: 'capitalize' }} variant="h3">
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
      </Paper>
      <Table aria-label={`List of ${type} maintenance`}>
        <TableHead>
          <TableRow>
            {flags.vmHostMaintenance?.enabled && (
              <>
                <TableCell className={classes.cell} style={{ width: '5%' }}>
                  Entity
                </TableCell>
                <TableCell
                  className={classes.cell}
                  style={
                    flags.vmHostMaintenance?.enabled && type === 'in progress'
                      ? { width: '30%' }
                      : {}
                  }
                >
                  Label
                </TableCell>
                {(type === 'scheduled' || type === 'completed') && (
                  <Hidden mdDown>
                    <TableSortCell
                      active={orderBy === 'when'}
                      className={classes.cell}
                      direction={order}
                      handleClick={handleOrderChange}
                      label="when"
                    >
                      When
                    </TableSortCell>
                  </Hidden>
                )}
                <TableSortCell
                  active={orderBy === maintenanceDateColumnMap[type][0]}
                  className={classes.cell}
                  direction={order}
                  handleClick={handleOrderChange}
                  label={maintenanceDateColumnMap[type][0]}
                >
                  {maintenanceDateColumnMap[type][1]}
                </TableSortCell>
              </>
            )}

            {!flags.vmHostMaintenance?.enabled && (
              <>
                <TableCell className={classes.cell}>Entity</TableCell>
                <TableCell className={classes.cell}>Label</TableCell>
                <TableSortCell
                  active={orderBy === 'when'}
                  className={classes.cell}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="when"
                >
                  Date
                </TableSortCell>
                <Hidden mdDown>
                  <TableSortCell
                    active={orderBy === 'when'}
                    className={classes.cell}
                    direction={order}
                    handleClick={handleOrderChange}
                    label="when"
                  >
                    When
                  </TableSortCell>
                </Hidden>
              </>
            )}

            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'type'}
                className={classes.cell}
                direction={order}
                handleClick={handleOrderChange}
                label="type"
              >
                Type
              </TableSortCell>
            </Hidden>
            {(!flags.vmHostMaintenance?.enabled ||
              type === 'scheduled' ||
              type === 'completed') && (
              <TableSortCell
                active={orderBy === 'status'}
                className={classes.cell}
                direction={order}
                handleClick={handleOrderChange}
                label="status"
              >
                Status
              </TableSortCell>
            )}
            <Hidden lgDown>
              <TableCell style={{ width: '40%' }}>Reason</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results || 0}
        eventCategory={`${type} Maintenance Table`}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Box>
  );
};
