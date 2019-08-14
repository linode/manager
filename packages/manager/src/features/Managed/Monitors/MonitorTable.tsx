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

import MonitorDialog from './MonitorDialog';
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
  const [dialogOpen, setDialog] = React.useState<boolean>(false);
  const [deleteError, setDeleteError] = React.useState<string | undefined>(
    undefined
  );
  const [selectedMonitor, setMonitor] = React.useState<number | undefined>(
    undefined
  );
  const [selectedLabel, setLabel] = React.useState<string>('');

  const handleOpenDialog = (id: number, label: string) => {
    setDeleteError(undefined);
    setDialog(true);
    setLabel(label);
    setMonitor(id);
  };

  const handleDelete = () => {
    if (!selectedMonitor) {
      return;
    }
    deleteServiceMonitor(selectedMonitor)
      .then(_ => {
        setDialog(false);
        enqueueSnackbar('Successfully deleted Service Monitor', {
          variant: 'success'
        });
      })
      .catch(err => {
        setDeleteError(err[0].reason);
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
              <AddNewLink onClick={() => null} label="Add a Monitor" disabled />
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
                        openDialog={handleOpenDialog}
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
      <MonitorDialog
        label={selectedLabel}
        onDelete={handleDelete}
        onClose={() => setDialog(false)}
        open={dialogOpen}
        error={deleteError}
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
