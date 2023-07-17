import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

import AddDeviceDrawer from './AddDeviceDrawer';
import FirewallDevicesTable from './FirewallDevicesTable';
import RemoveDeviceDialog from './RemoveDeviceDialog';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    '&.MuiGrid-item': {
      paddingTop: 0,
    },
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(),
    [theme.breakpoints.only('sm')]: {
      marginRight: theme.spacing(),
    },
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(),
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  disabled: boolean;
  firewallID: number;
  firewallLabel: string;
}

const FirewallLinodesLanding = (props: Props) => {
  const { disabled, firewallID, firewallLabel } = props;
  const classes = useStyles();

  const { data: devices, error, isLoading } = useAllFirewallDevicesQuery(
    firewallID
  );

  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(-1);

  const selectedDevice = devices?.find(
    (device) => device.id === selectedDeviceId
  );

  const [addDeviceDrawerOpen, setDeviceDrawerOpen] = React.useState<boolean>(
    false
  );

  const handleClose = () => {
    setDeviceDrawerOpen(false);
  };

  return (
    <>
      {disabled ? (
        <Notice
          text={
            "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
          }
          error
          important
        />
      ) : null}
      <Grid container direction="column">
        <Grid style={{ paddingBottom: 0 }}>
          <Typography className={classes.copy}>
            The following Linodes have been assigned to this Firewall. A Linode
            can only be assigned to a single Firewall.
          </Typography>
        </Grid>
        <Grid className={classes.actions}>
          <Button
            buttonType="primary"
            disabled={disabled}
            onClick={() => setDeviceDrawerOpen(true)}
          >
            Add Linodes to Firewall
          </Button>
        </Grid>
      </Grid>
      <FirewallDevicesTable
        triggerRemoveDevice={(id) => {
          setSelectedDeviceId(id);
          setIsRemoveDeviceDialogOpen(true);
        }}
        devices={devices ?? []}
        disabled={disabled}
        error={error ?? undefined}
        loading={isLoading}
      />
      <AddDeviceDrawer onClose={handleClose} open={addDeviceDrawerOpen} />
      <RemoveDeviceDialog
        device={selectedDevice}
        firewallId={firewallID}
        firewallLabel={firewallLabel}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        open={isRemoveDeviceDialogOpen}
      />
    </>
  );
};

export default React.memo(FirewallLinodesLanding);
