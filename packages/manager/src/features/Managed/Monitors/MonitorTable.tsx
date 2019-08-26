import { FormikBag } from 'formik';
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
import withManagedServices, {
  DispatchProps
} from 'src/containers/managedServices.container';
import { useDialog } from 'src/hooks/useDialog';
import { ManagedServicePayload } from 'src/services/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';

import MonitorDrawer from '../MonitorDrawer';
import MonitorTableContent from './MonitorTableContent';

type ClassNames = 'labelHeader';

const styles = (theme: Theme) =>
  createStyles({
    labelHeader: {
      paddingLeft: theme.spacing(2) + 49
    }
  });

interface Props {
  monitors: Linode.ManagedServiceMonitor[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

export type Modes = 'create' | 'edit';
export type FormikProps = FormikBag<CombinedProps, ManagedServicePayload>;

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  DispatchProps &
  WithSnackbarProps;

export const MonitorTable: React.FC<CombinedProps> = props => {
  const {
    classes,
    deleteServiceMonitor,
    enqueueSnackbar,
    error,
    loading,
    monitors
  } = props;

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError
  } = useDialog<number>(deleteServiceMonitor);

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerMode, setDrawerMode] = React.useState<Modes>('create');
  const [editID, setEditID] = React.useState<number>(0);

  const handleDrawerClose = () => {
    setEditID(0);
    setDrawerMode('create');
    setDrawerOpen(false);
  };

  const handleDrawerOpen = (id: number, mode: Modes) => {
    setEditID(id);
    setDrawerMode(mode);
    setDrawerOpen(true);
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
    console.log(values);
    setSubmitting(false);
    return;
    const { createServiceMonitor } = props;
    createServiceMonitor({ ...values, timeout: +values.timeout })
      .then(response => {
        setSubmitting(false);
        setDrawerOpen(false);
      })
      .catch(e => {
        const defaultMessage = `Unable to create this Monitor. Please try again later.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, e);
        handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
        setSubmitting(false);
      });
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
                onClick={() => setDrawerOpen(true)}
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
                        loading={loading}
                        error={error}
                        openDialog={openDialog}
                        openDrawer={handleDrawerOpen}
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
        open={drawerOpen}
        onClose={handleDrawerClose}
        onSubmit={submitMonitorForm}
        mode={drawerMode}
        monitor={monitors.find(m => m.id === editID)}
      />
    </>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  styled,
  withManagedServices(() => ({})),
  withSnackbar
);
export default enhanced(MonitorTable);
