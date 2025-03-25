import { Button } from '@linode/ui';
import { useDialog } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  useAllManagedContactsQuery,
  useAllManagedCredentialsQuery,
  useAllManagedIssuesQuery,
  useAllManagedMonitorsQuery,
  useCreateMonitorMutation,
  useDeleteMonitorMutation,
  useUpdateMonitorMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import MonitorDrawer from '../MonitorDrawer';
import { HistoryDrawer } from './HistoryDrawer';
import { StyledGrid } from './MonitorTable.styles';
import MonitorTableContent from './MonitorTableContent';

import type { ManagedServicePayload } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';
import type { FormikBag } from 'formik';

export type Modes = 'create' | 'edit';
export type FormikProps = FormikBag<{}, ManagedServicePayload>;

export const MonitorTable = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, error, isLoading } = useAllManagedMonitorsQuery();
  const {
    data: issues,
    failureReason,
    isFetching: areIssuesFetching,
  } = useAllManagedIssuesQuery();
  const { data: credentials } = useAllManagedCredentialsQuery();
  const { data: contacts } = useAllManagedContactsQuery();

  const { mutateAsync: deleteServiceMonitor } = useDeleteMonitorMutation();

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

  const monitors = data || [];

  const {
    closeDialog,
    dialog,
    handleError,
    openDialog,
    submitDialog,
  } = useDialog<number>((id) => deleteServiceMonitor({ id: id || -1 }));

  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState<boolean>(
    false
  );

  const [monitorDrawerOpen, setMonitorDrawerOpen] = React.useState<boolean>(
    false
  );
  const [drawerMode, setDrawerMode] = React.useState<Modes>('create');
  const [editID, setEditID] = React.useState<number>(0);

  const { mutateAsync: updateServiceMonitor } = useUpdateMonitorMutation(
    editID
  );
  const { mutateAsync: createServiceMonitor } = useCreateMonitorMutation();

  const [editLabel, setEditLabel] = React.useState<string>('');

  const handleDrawerClose = () => {
    setEditID(0);
    setDrawerMode('create');
    setMonitorDrawerOpen(false);
  };

  const handleMonitorDrawerOpen = (id: number, mode: Modes) => {
    setEditID(id);
    setDrawerMode(mode);
    setMonitorDrawerOpen(true);
  };

  const handleHistoryDrawerOpen = (id: number, label: string) => {
    setEditID(id);
    setEditLabel(label);
    setHistoryDrawerOpen(true);
  };

  const handleDelete = () => {
    if (!dialog.entityID) {
      return;
    }
    submitDialog(dialog.entityID)
      .then((_) => {
        enqueueSnackbar('Successfully deleted Service Monitor', {
          variant: 'success',
        });
      })
      .catch((err) => {
        handleError(
          getAPIErrorOrDefault(err, 'Error deleting this Service Monitor.')[0]
            .reason
        );
      });
  };

  const submitMonitorForm = (
    values: ManagedServicePayload,
    { setErrors, setStatus, setSubmitting }: FormikProps
  ) => {
    const _success = () => {
      setSubmitting(false);
      handleDrawerClose();
    };

    const _error = (e: APIError[]) => {
      const defaultMessage = `Unable to ${
        drawerMode === 'create' ? 'create' : 'update'
      } this Monitor. Please try again later.`;
      const mapErrorToStatus = (generalError: string) =>
        setStatus({ generalError });

      setSubmitting(false);
      handleFieldErrors(setErrors, e);
      handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
      setSubmitting(false);
    };

    // Clear drawer error state
    setStatus(undefined);

    // eslint-disable-next-line no-unused-expressions
    drawerMode === 'create'
      ? createServiceMonitor({ ...values, timeout: +values.timeout })
          .then(_success)
          .catch(_error)
      : updateServiceMonitor({
          ...values,
          timeout: +values.timeout,
        })
          .then(_success)
          .catch(_error);
  };

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
                onClick={() => setMonitorDrawerOpen(true)}
              >
                Add Monitor
              </Button>
            </StyledGrid>
          </Grid>
        </Grid>
      </Grid>
      <OrderBy data={monitors} order={'asc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
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
                      error={error}
                      issues={issues || []}
                      loading={isLoading}
                      monitors={data}
                      openDialog={openDialog}
                      openHistoryDrawer={handleHistoryDrawerOpen}
                      openMonitorDrawer={handleMonitorDrawerOpen}
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
        )}
      </OrderBy>
      <DeletionDialog
        entity="monitor"
        error={dialog.error}
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        onClose={closeDialog}
        onDelete={handleDelete}
        open={dialog.isOpen}
      />
      <MonitorDrawer
        credentials={credentials || []}
        groups={groups}
        mode={drawerMode}
        monitor={monitors.find((m) => m.id === editID)}
        onClose={handleDrawerClose}
        onSubmit={submitMonitorForm}
        open={monitorDrawerOpen}
      />
      <HistoryDrawer
        issues={issues?.filter((thisIssue) =>
          thisIssue.services.includes(editID)
        )}
        error={failureReason}
        isFetching={areIssuesFetching}
        monitorLabel={editLabel}
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
      />
    </>
  );
};

export default MonitorTable;
