import { getTrustedDevices, TrustedDevice } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ToggleState from 'src/components/ToggleState';
import Dialog from './TrustedDevicesDialog';
import TrustedDevicesTable from './TrustedDevicesTable';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  usedCell: {
    minWidth: 125,
  },
  expireCell: {
    minWidth: 95,
  },
  disabled: {
    '& *': {
      color: theme.color.disabledText,
    },
  },
}));

interface Props {
  disabled?: boolean;
}

type CombinedProps = Props & PaginationProps<TrustedDevice>;

export const TrustedDevices: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const refreshList = () => {
    props.onDelete();
  };

  React.useEffect(() => {
    props.handleOrderChange('expiry', 'asc');
  }, []);

  const {
    loading,
    data: devices,
    count,
    page,
    error,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    disabled,
  } = props;

  const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(0);

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
                <TableCell>Device</TableCell>
                <TableCell>Last IP</TableCell>
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
                  setDevice={setSelectedDeviceId}
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

export default compose<CombinedProps, Props>(paginated)(TrustedDevices);
