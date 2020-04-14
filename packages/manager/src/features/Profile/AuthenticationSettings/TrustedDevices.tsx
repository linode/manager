import { getTrustedDevices, TrustedDevice } from 'linode-js-sdk/lib/profile';
import * as React from 'react';
import {
  compose,
  lifecycle,
  StateHandlerMap,
  withStateHandlers
} from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ToggleState from 'src/components/ToggleState';
import Dialog from './TrustedDevicesDialog';
import TrustedDevicesTable from './TrustedDevicesTable';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2)
  },
  deviceCell: {},
  ipCell: {},
  usedCell: {
    minWidth: 120
  },
  expireCell: {
    minWidth: 100
  },
  disabled: {
    '& *': {
      color: theme.color.disabledText
    }
  }
}));

interface Props {
  disabled?: boolean;
}

type CombinedProps = Props &
  PaginationProps<TrustedDevice> &
  StateUpdaters &
  DialogState;

export const TrustedDevices: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const refreshList = () => {
    props.onDelete();
  };

  const {
    loading,
    data: devices,
    count,
    page,
    error,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    selectedDeviceId,
    setSelectedDevice,
    disabled
  } = props;

  return (
    <ToggleState>
      {({ open: dialogOpen, toggle: toggleDialog }) => (
        <Paper className={disabled ? classes.disabled : ''}>
          <Typography variant="h3" className={classes.title}>
            Trusted Devices
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.deviceCell}>Device</TableCell>
                <TableCell className={classes.ipCell}>Last IP</TableCell>
                <TableCell className={classes.usedCell}>Last Used</TableCell>
                <TableCell className={classes.expireCell}>Expires</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {!disabled && (
                <TrustedDevicesTable
                  error={error}
                  data={devices}
                  loading={loading}
                  toggleDialog={toggleDialog}
                  setDevice={setSelectedDevice}
                />
              )}
            </TableBody>
            {devices && devices.length > 0 && (
              <PaginationFooter
                count={count}
                page={page}
                pageSize={pageSize}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                eventCategory="Trusted Devices Panel"
              />
            )}
          </Table>
          <Dialog
            open={dialogOpen}
            closeDialog={toggleDialog}
            deviceId={selectedDeviceId}
            refreshListOfDevices={refreshList}
          />
        </Paper>
      )}
    </ToggleState>
  );
};

const paginated = Pagey((ownProps: {}, params: any, filter: any) =>
  getTrustedDevices(params, filter).then(response => response)
);

const withRequestOnMount = lifecycle<PaginationProps<TrustedDevice>, {}>({
  componentDidMount() {
    /** initial request for trusted devices, ordered by which ones expire first */
    this.props.handleOrderChange('expiry', 'asc');
  }
});

export interface DialogState {
  selectedDeviceId?: number;
}

export interface StateUpdaters {
  setSelectedDevice: (deviceId: number) => void;
}

type StateAndStateUpdaters = StateHandlerMap<DialogState> & StateUpdaters;

const withDialogHandlers = withStateHandlers<
  DialogState,
  StateAndStateUpdaters,
  {}
>(
  {
    selectedDeviceId: undefined
  },
  {
    setSelectedDevice: () => (deviceId: number) => ({
      selectedDeviceId: deviceId
    })
  }
);

export default compose<CombinedProps, {}>(
  withDialogHandlers,
  paginated,
  withRequestOnMount
)(TrustedDevices);
