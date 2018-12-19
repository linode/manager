import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose, lifecycle, StateHandlerMap, withStateHandlers } from 'recompose';

import { getTrustedDevices } from 'src/services/profile';

import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import Dialog from './TrustedDevicesDialog';
import TrustedDevicesTable from './TrustedDevicesTable';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  }
});

type CombinedProps = PaginationProps<Linode.Device>
  & WithStyles<ClassNames>
  & StateUpdaters
  & DialogState;

class TrustedDevices extends React.PureComponent<CombinedProps, {}> {
  handleDeleteDevice = (deviceId: number) => {
    this.props.setSelectedDevice(deviceId)
    this.props.toggleDialog()
  }

  refreshList = () => {
    this.props.onDelete({ orderBy: 'expiry', order: 'asc' });
  }

  render() {
    const {
      classes,
      loading,
      data: devices,
      count,
      page,
      error,
      pageSize,
      handlePageChange,
      handlePageSizeChange,
      toggleDialog,
      selectedDeviceId,
      dialogOpen
    } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography
          role="header"
          variant="h2"
          className={classes.title}
          data-qa-title
        >
          Trusted Devices
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TrustedDevicesTable
              error={error}
              data={devices}
              loading={loading}
              triggerDeletion={this.handleDeleteDevice}
            />
          </TableBody>
          {devices && devices.length > 0 &&
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              eventCategory="Trusted Devices Panel"
            />
          }
        </Table>
        <Dialog
          open={dialogOpen}
          closeDialog={toggleDialog}
          deviceId={selectedDeviceId}
          refreshListOfDevices={this.refreshList}
        />
      </Paper>
    );
  }
}

const paginated = Pagey(
  (ownProps: {}, params: any, filter: any) => getTrustedDevices(params, filter)
    .then(response => response)
)

const styled = withStyles(styles);

const withRequestOnMount = lifecycle<PaginationProps<Linode.Device>, {}>({
  componentDidMount() {
    /** initial request for trusted devices, ordered by which ones expire first */
    this.props.handleOrderChange('expiry', 'asc');
  }
})

export interface DialogState {
  dialogOpen: boolean;
  selectedDeviceId?: number;
}

export interface StateUpdaters {
  toggleDialog: () => void;
  setSelectedDevice: (deviceId: number) => void;
}

type StateAndStateUpdaters = StateHandlerMap<DialogState> &
  StateUpdaters;

const withDialogHandlers = withStateHandlers<
  DialogState,
  StateAndStateUpdaters,
  {}
  >(
    {
      dialogOpen: false,
      selectedDeviceId: undefined
    }, {
      toggleDialog: (state: DialogState) => () => ({
        dialogOpen: !state.dialogOpen
      }),
      setSelectedDevice: () => (deviceId: number) => ({
        selectedDeviceId: deviceId
      })
    }
  )

export default compose<CombinedProps, {}>(
  withDialogHandlers,
  paginated,
  withRequestOnMount,
  styled,
)(TrustedDevices);
