import { ManagedServicePayload } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { FormikBag } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useDialog } from 'src/hooks/useDialog';
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
import HistoryDrawer from './HistoryDrawer';
import MonitorTableContent from './MonitorTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  addNewWrapper: {
    marginBottom: 5,
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
  },
  headers: {
    '& > th': {
      fontFamily: theme.font.bold,
    },
  },
  labelHeader: {
    ...theme.applyTableHeaderStyles,
    paddingLeft: `62px !important`,
  },
}));

export type Modes = 'create' | 'edit';
export type FormikProps = FormikBag<{}, ManagedServicePayload>;

export const MonitorTable = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, error } = useAllManagedMonitorsQuery();
  const {
    data: issues,
    isLoading: areIssuesLoading,
    error: issuesError,
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
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError,
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
    { setSubmitting, setErrors, setStatus }: FormikProps
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
        justifyContent="flex-end"
        alignItems="flex-end"
        updateFor={[classes]}
      >
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className={classes.addNewWrapper}>
              <AddNewLink
                onClick={() => setMonitorDrawerOpen(true)}
                label="Add Monitor"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <OrderBy data={monitors} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              data,
              count,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
            }) => (
              <>
                <Table aria-label="List of Your Managed Service Monitors">
                  <TableHead>
                    <TableRow className={classes.headers}>
                      <TableSortCell
                        active={orderBy === 'label'}
                        label={'label'}
                        direction={order}
                        handleClick={handleOrderChange}
                        className={classes.labelHeader}
                        data-qa-monitor-label-header
                      >
                        Monitor
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'status'}
                        label={'status'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-monitor-status-header
                      >
                        Status
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'address'}
                        label={'address'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-monitor-resource-header
                      >
                        Resource
                      </TableSortCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <MonitorTableContent
                      monitors={data}
                      issues={issues || []}
                      loading={isLoading}
                      error={error}
                      openDialog={openDialog}
                      openMonitorDrawer={handleMonitorDrawerOpen}
                      openHistoryDrawer={handleHistoryDrawerOpen}
                    />
                  </TableBody>
                </Table>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="managed service monitor table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <DeletionDialog
        label={dialog.entityLabel || ''}
        entity="monitor"
        onDelete={handleDelete}
        onClose={closeDialog}
        open={dialog.isOpen}
        error={dialog.error}
        loading={dialog.isLoading}
      />
      <MonitorDrawer
        open={monitorDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={submitMonitorForm}
        mode={drawerMode}
        monitor={monitors.find((m) => m.id === editID)}
        groups={groups}
        credentials={credentials || []}
      />
      <HistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        monitorLabel={editLabel}
        issues={issues?.filter((thisIssue) =>
          thisIssue.services.includes(editID)
        )}
        loading={areIssuesLoading}
        error={issuesError}
      />
    </>
  );
};

export default MonitorTable;
