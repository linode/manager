import { FormikBag } from 'formik';
import {
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedServicePayload
} from 'linode-js-sdk/lib/managed';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import { ManagedIssuesProps } from 'src/containers/managedIssues.container';
import { DispatchProps } from 'src/containers/managedServices.container';
import { useDialog } from 'src/hooks/useDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';

import MonitorDrawer from '../MonitorDrawer';
import HistoryDrawer from './HistoryDrawer';
import MonitorTableContent from './MonitorTableContent';

type ClassNames = 'labelHeader';

const styles = (theme: Theme) =>
  createStyles({
    labelHeader: {
      paddingLeft: theme.spacing(4) + 32
    }
  });

interface Props {
  monitors: ManagedServiceMonitor[];
  credentials: ManagedCredential[];
  groups: string[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

export type Modes = 'create' | 'edit';
export type FormikProps = FormikBag<CombinedProps, ManagedServicePayload>;

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  DispatchProps &
  ManagedIssuesProps &
  WithSnackbarProps;

export const MonitorTable: React.FC<CombinedProps> = props => {
  const {
    classes,
    deleteServiceMonitor,
    enqueueSnackbar,
    error,
    loading,
    monitors,
    groups,
    credentials,
    issues,
    issuesError,
    issuesLoading,
    lastUpdated
  } = props;

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError
  } = useDialog<number>(deleteServiceMonitor);

  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState<boolean>(
    false
  );

  const [monitorDrawerOpen, setMonitorDrawerOpen] = React.useState<boolean>(
    false
  );
  const [drawerMode, setDrawerMode] = React.useState<Modes>('create');
  const [editID, setEditID] = React.useState<number>(0);

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
      .then(_ => {
        enqueueSnackbar('Successfully deleted Service Monitor', {
          variant: 'success'
        });
      })
      .catch(err => {
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
    const { createServiceMonitor, updateServiceMonitor } = props;
    const _success = () => {
      setSubmitting(false);
      handleDrawerClose();
    };

    const _error = (e: Linode.ApiFieldError[]) => {
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

    drawerMode === 'create'
      ? createServiceMonitor({ ...values, timeout: +values.timeout })
          .then(_success)
          .catch(_error)
      : updateServiceMonitor({
          ...values,
          monitorID: editID,
          timeout: +values.timeout
        })
          .then(_success)
          .catch(_error);
  };

  return (
    <>
      <DocumentTitleSegment segment="Service Monitors" />
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        updateFor={[classes]}
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              <AddNewLink
                onClick={() => setMonitorDrawerOpen(true)}
                label="Add a Monitor"
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
              pageSize
            }) => (
              <>
                <Paper>
                  <Table aria-label="List of Your Managed Service Monitors">
                    <TableHead>
                      <TableRow>
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
                          active={orderBy === 'resource'}
                          label={'resource'}
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
                        issues={issues}
                        loading={loading}
                        error={error}
                        openDialog={openDialog}
                        openMonitorDrawer={handleMonitorDrawerOpen}
                        openHistoryDrawer={handleHistoryDrawerOpen}
                      />
                    </TableBody>
                  </Table>
                </Paper>
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
        monitor={monitors.find(m => m.id === editID)}
        groups={groups}
        credentials={credentials}
      />
      <HistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        monitorLabel={editLabel}
        issues={issues.filter(thisIssue => thisIssue.services.includes(editID))}
        loading={issuesLoading && lastUpdated === 0}
        error={issuesError.read}
      />
    </>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  withSnackbar,
  styled
);
export default enhanced(MonitorTable);
