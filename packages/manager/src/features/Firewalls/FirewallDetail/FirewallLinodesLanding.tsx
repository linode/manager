import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import AddNewLink from 'src/components/AddNewLink';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
import FirewallDevicesTable from './FirewallDevicesTable';

const useStyles = makeStyles((theme: Theme) => ({
  message: {
    fontSize: '16px'
  }
}));

interface Props {
  firewallID: number;
}

type CombinedProps = RouteComponentProps & Props;

const FirewallLinodesLanding: React.FC<CombinedProps> = props => {
  const { firewallID } = props;
  const classes = useStyles();
  const { devices, requestDevices } = useFirewallDevices(firewallID);

  const deviceList = Object.values(devices.itemsById ?? {}); // Gives the devices as an array or [] if nothing is found
  React.useEffect(() => {
    if (devices.lastUpdated === 0 && !devices.loading) {
      requestDevices();
    }
  }, [firewallID]);
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
        triggerRemoveDevice={(deviceID: number, label: string) => null}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  FirewallLinodesLanding
);
