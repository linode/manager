import { Button } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import {
  useAllManagedContactsQuery,
  useAllManagedCredentialsQuery,
  useAllManagedIssuesQuery,
  useAllManagedMonitorsQuery,
  useDeleteMonitorMutation,
  useGetMonitorQuery,
} from 'src/queries/managed/managed';

import { MonitorDrawer } from '../MonitorDrawer';
import { HistoryDrawer } from './HistoryDrawer';
import { StyledGrid } from './MonitorTable.styles';
import { MonitorTableContent } from './MonitorTableContent';

import type { ManagedServicePayload } from '@linode/api-v4/lib/managed';
import type { FormikBag } from 'formik';

export type Modes = 'create' | 'edit';
export type FormikProps = FormikBag<{}, ManagedServicePayload>;

export const MonitorTable = () => {
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: monitors,
    error: monitorsError,
    isLoading,
  } = useAllManagedMonitorsQuery();
  const { data: credentials } = useAllManagedCredentialsQuery();
  const { data: contacts } = useAllManagedContactsQuery();

  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const { mutateAsync: deleteServiceMonitor } = useDeleteMonitorMutation();

  const { data: issues } = useDialogData({
    enabled: match.routeId === '/managed/monitors/$monitorId/issues',
    paramKey: 'monitorId',
    queryHook: useAllManagedIssuesQuery,
    redirectToOnNotFound: '/managed/monitors',
  });

  const { data: selectedMonitor, isFetching: isFetchingSelectedMonitor } =
    useDialogData({
      enabled:
        match.routeId === '/managed/monitors/$monitorId/edit' ||
        match.routeId === '/managed/monitors/$monitorId/issues' ||
        match.routeId === '/managed/monitors/$monitorId/delete',
      paramKey: 'monitorId',
      queryHook: useGetMonitorQuery,
      redirectToOnNotFound: '/managed/monitors',
    });

  const groups = React.useMemo(() => {
    if (!contacts) {
      return [];
    }
    const _groups: string[] = [];
    let i = 0;
    for (i; i < contacts.length; i++) {
      if (contacts[i].group !== null && !_groups.includes(contacts[i].group!)) {
        _groups.push(contacts[i].group as string);
      }
    }
    return _groups;
  }, [contacts]);

  const handleDelete = () => {
    if (!selectedMonitor?.id) {
      return;
    }

    deleteServiceMonitor({ id: selectedMonitor.id })
      .then((_) => {
        enqueueSnackbar('Successfully deleted Service Monitor', {
          variant: 'success',
        });
        navigate({ to: '/managed/monitors' });
      })
      .catch((err) => {
        setDeleteError(err[0].reason || 'Error deleting this Service Monitor.');
      });
  };

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: sortedMonitors,
  } = useOrderV2({
    data: monitors,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/managed/monitors',
    },
    preferenceKey: 'managed-monitors',
  });

  const isMonitorDrawerOpen =
    match.routeId === '/managed/monitors/add' ||
    match.routeId === '/managed/monitors/$monitorId/edit';
  const isHistoryDrawerOpen =
    match.routeId === '/managed/monitors/$monitorId/issues';
  const isDeleteDialogOpen =
    match.routeId === '/managed/monitors/$monitorId/delete';

  return (
    <>
      <DocumentTitleSegment segment="Monitors" />
      <Grid
        container
        sx={{
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Grid>
          <Grid
            container
            sx={{
              alignItems: 'flex-end',
            }}
          >
            <StyledGrid>
              <Button
                buttonType="primary"
                onClick={() => navigate({ to: '/managed/monitors/add' })}
                sx={{ mb: 0.5 }}
              >
                Add Monitor
              </Button>
            </StyledGrid>
          </Grid>
        </Grid>
      </Grid>
      <Paginate data={sortedMonitors ?? []}>
        {({
          count,
          data,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        }) => (
          <>
            <Table aria-label="List of Your Managed Service Monitors">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'label'}
                    data-qa-monitor-label-header
                    direction={order}
                    handleClick={handleOrderChange}
                    label={'label'}
                  >
                    Monitor
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'status'}
                    data-qa-monitor-status-header
                    direction={order}
                    handleClick={handleOrderChange}
                    label={'status'}
                  >
                    Status
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'address'}
                    data-qa-monitor-resource-header
                    direction={order}
                    handleClick={handleOrderChange}
                    label={'address'}
                  >
                    Resource
                  </TableSortCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <MonitorTableContent
                  error={monitorsError}
                  issues={issues || []}
                  loading={isLoading}
                  monitors={data}
                />
              </TableBody>
            </Table>
            <PaginationFooter
              count={count}
              eventCategory="managed service monitor table"
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
            />
          </>
        )}
      </Paginate>
      <DeletionDialog
        entity="monitor"
        error={deleteError}
        label={selectedMonitor?.label || ''}
        loading={isFetchingSelectedMonitor}
        onClose={() => {
          setDeleteError(undefined);
          navigate({ to: '/managed/monitors' });
        }}
        onDelete={handleDelete}
        open={isDeleteDialogOpen}
      />
      <MonitorDrawer
        credentials={credentials || []}
        groups={groups}
        isFetching={isFetchingSelectedMonitor}
        monitor={selectedMonitor}
        open={isMonitorDrawerOpen}
      />
      <HistoryDrawer
        isFetching={isFetchingSelectedMonitor}
        issues={issues?.filter((thisIssue) =>
          thisIssue.services.includes(selectedMonitor?.id ?? -1)
        )}
        monitorLabel={selectedMonitor?.label}
        onClose={() => navigate({ to: '/managed/monitors' })}
        open={isHistoryDrawerOpen}
      />
    </>
  );
};
