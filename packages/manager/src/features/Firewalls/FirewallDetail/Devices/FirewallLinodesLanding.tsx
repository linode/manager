import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import AddNewLink from 'src/components/AddNewLink';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useDialog } from 'src/hooks/useDialog';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import FirewallDevicesTable from './FirewallDevicesTable';
import RemoveDeviceDialog from './RemoveDeviceDialog';

const useStyles = makeStyles((theme: Theme) => ({
  message: {
    fontSize: '16px'
  }
}));

interface Props {
  firewallID: number;
  firewallLabel: string;
}

type CombinedProps = RouteComponentProps & Props;

const FirewallLinodesLanding: React.FC<CombinedProps> = props => {
  const { firewallID, firewallLabel } = props;
  const classes = useStyles();
  const { devices, requestDevices, removeDevice } = useFirewallDevices(
    firewallID
  );

  const deviceList = Object.values(devices.itemsById ?? {}); // Gives the devices as an array or [] if nothing is found
  React.useEffect(() => {
    if (devices.lastUpdated === 0 && !devices.loading) {
      requestDevices();
    }
  }, [firewallID]);

  const {
    dialog,
    openDialog,
    closeDialog,
    handleError,
    submitDialog
  } = useDialog<number>(removeDevice);

  const handleRemoveDevice = () => {
    submitDialog(dialog.entityID).catch(e =>
      handleError(getAPIErrorOrDefault(e, 'Error removing Device')[0].reason)
    );
  };

  return (
    <>
      <Typography className={classes.message}>
        The following Linodes have been assigned to this Firewall.
      </Typography>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="flex-end"
        justifyContent="flex-end"
      >
        <AddNewLink
          onClick={() => null}
          disabled={true}
          label="Add Linodes to Firewall"
        />
      </Box>
      <FirewallDevicesTable
        devices={deviceList}
        error={devices.error.read}
        lastUpdated={devices.lastUpdated}
        loading={devices.loading}
        triggerRemoveDevice={openDialog}
      />
      <RemoveDeviceDialog
        open={dialog.isOpen}
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={closeDialog}
        onRemove={handleRemoveDevice}
        deviceLabel={dialog.entityLabel ?? 'this device'}
        firewallLabel={firewallLabel}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  FirewallLinodesLanding
);
