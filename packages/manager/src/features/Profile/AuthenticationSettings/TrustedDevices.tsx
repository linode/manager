import { getTrustedDevices, TrustedDevice } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow';
import ToggleState from 'src/components/ToggleState';
import Dialog from './TrustedDevicesDialog';
import TrustedDevicesTable from './TrustedDevicesTable';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
  },
  dates: {
    minWidth: 150,
  },
}));

type CombinedProps = PaginationProps<TrustedDevice>;

export const TrustedDevices: React.FC<CombinedProps> = (props) => {
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
  } = props;

  const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(0);

  return (
    <ToggleState>
      {({ open: dialogOpen, toggle: toggleDialog }) => (
        <>
          <Typography variant="h3">Trusted Devices</Typography>
          <Typography variant="body1" className={classes.copy} data-qa-copy>
            To add a trusted device, check the box &quot;Trust this device for
            30 days&quot; at login.
          </Typography>
          {devices && devices.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Last IP</TableCell>
                  <TableCell className={classes.dates}>Last Used</TableCell>
                  <TableCell className={classes.dates}>Expires</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TrustedDevicesTable
                  error={error}
                  data={devices}
                  loading={loading}
                  toggleDialog={toggleDialog}
                  setDevice={setSelectedDeviceId}
                />
              </TableBody>
              <PaginationFooter
                count={count}
                page={page}
                pageSize={pageSize}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                eventCategory="Trusted Devices Panel"
              />
            </Table>
          )}
          <Dialog
            open={dialogOpen}
            closeDialog={toggleDialog}
            deviceId={selectedDeviceId}
            refreshListOfDevices={refreshList}
          />
        </>
      )}
    </ToggleState>
  );
};

const paginated = Pagey((ownProps: {}, params: any, filter: any) =>
  getTrustedDevices(params, filter).then((response) => response)
);

export default compose<CombinedProps, {}>(paginated)(TrustedDevices);
