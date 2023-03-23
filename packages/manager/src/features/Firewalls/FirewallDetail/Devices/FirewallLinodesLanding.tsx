import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import AddDeviceDrawer from './AddDeviceDrawer';
import FirewallDevicesTable from './FirewallDevicesTable';
import RemoveDeviceDialog from './RemoveDeviceDialog';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(),
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(),
    '&.MuiGrid-item': {
      paddingTop: 0,
    },
    [theme.breakpoints.only('sm')]: {
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  firewallID: number;
  firewallLabel: string;
  disabled: boolean;
}

const FirewallLinodesLanding = (props: Props) => {
  const { firewallID, firewallLabel, disabled } = props;
  const classes = useStyles();

  const { data: devices, isLoading, error } = useAllFirewallDevicesQuery(
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
        <Grid item style={{ paddingBottom: 0 }}>
          <Typography className={classes.copy}>
            The following Linodes have been assigned to this Firewall. A Linode
            can only be assigned to a single Firewall.
          </Typography>
        </Grid>
        <Grid item className={classes.actions}>
          <Button
            buttonType="primary"
            disabled={disabled}
            onClick={() => setDeviceDrawerOpen(true)}
            compactX
          >
            Add Linodes to Firewall
          </Button>
        </Grid>
      </Grid>
      <FirewallDevicesTable
        devices={devices ?? []}
        error={error ?? undefined}
        loading={isLoading}
        disabled={disabled}
        triggerRemoveDevice={(id) => {
          setSelectedDeviceId(id);
          setIsRemoveDeviceDialogOpen(true);
        }}
      />
      <AddDeviceDrawer open={addDeviceDrawerOpen} onClose={handleClose} />
      <RemoveDeviceDialog
        open={isRemoveDeviceDialogOpen}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        device={selectedDevice}
        firewallLabel={firewallLabel}
        firewallId={firewallID}
      />
    </>
  );
};

export default React.memo(FirewallLinodesLanding);
