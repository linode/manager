import { APIError } from '@linode/api-v4/lib/types';
import Promise from 'bluebird';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import withLinodes, {
  Props as LinodesProps,
} from 'src/containers/withLinodes.container';
import { useDialog } from 'src/hooks/useDialog';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddDeviceDrawer from './AddDeviceDrawer';
import FirewallDevicesTable from './FirewallDevicesTable';
import RemoveDeviceDialog from './RemoveDeviceDialog';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    '&.MuiGrid-item': {
      paddingTop: 0,
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  firewallID: number;
  firewallLabel: string;
}

type CombinedProps = RouteComponentProps & Props & LinodesProps;

const FirewallLinodesLanding: React.FC<CombinedProps> = (props) => {
  const { firewallID, firewallLabel } = props;
  const classes = useStyles();
  const {
    devices,
    requestDevices,
    removeDevice,
    addDevice,
  } = useFirewallDevices(firewallID);

  const deviceList = Object.values(devices.itemsById ?? {}); // Gives the devices as an array or [] if nothing is found
  React.useEffect(() => {
    if (devices.lastUpdated === 0 && !devices.loading) {
      requestDevices();
    }
  }, [devices.lastUpdated, devices.loading, firewallID, requestDevices]);

  const {
    dialog,
    openDialog,
    closeDialog,
    handleError,
    submitDialog,
  } = useDialog<number>(removeDevice);

  const _openDialog = React.useCallback(openDialog, [dialog, openDialog]);
  const _closeDialog = React.useCallback(closeDialog, [dialog, closeDialog]);
  const _submitDialog = React.useCallback(submitDialog, [dialog, submitDialog]);

  const [addDeviceDrawerOpen, setDeviceDrawerOpen] = React.useState<boolean>(
    false
  );
  const [deviceSubmitting, setDeviceSubmitting] = React.useState<boolean>(
    false
  );
  const [addDeviceError, setDeviceError] = React.useState<
    APIError[] | undefined
  >();

  const handleAddDevice = (selectedLinodes: number[]) => {
    setDeviceSubmitting(true);
    setDeviceError(undefined);
    return Promise.map(selectedLinodes, (thisLinode) => {
      return addDevice({ type: 'linode', id: thisLinode });
    })
      .then((_) => {
        handleClose();
      })
      .catch((errorResponse) => {
        /**
         * API errors here identify the invalid Linode
         * by its ID rather than label, which isn't helpful
         * to Cloud users. This maps the ID onto the matching
         * Linode if there is one, otherwise it should leave
         * the message unaltered.
         */
        const errorWithLinodeLabel = [
          {
            reason: errorResponse[0].reason.replace(
              /with ID ([0-9]+)/,
              (match: string, group: string) => {
                const linode = props.linodesData.find(
                  (thisLinode) => thisLinode.id === +group
                );
                return linode ? linode.label : match;
              }
            ),
          },
        ];
        setDeviceError(errorWithLinodeLabel);
        setDeviceSubmitting(false);
      });
  };

  const handleClose = () => {
    setDeviceError(undefined);
    setDeviceDrawerOpen(false);
    setDeviceSubmitting(false);
  };

  const handleRemoveDevice = () => {
    _submitDialog(dialog.entityID).catch((e) =>
      handleError(getAPIErrorOrDefault(e, 'Error removing Device')[0].reason)
    );
  };

  return (
    <>
      <Grid container direction="column">
        <Grid item style={{ paddingBottom: 0 }}>
          <Typography className={classes.copy}>
            The following Linodes have been assigned to this Firewall. A Linode
            can only be assigned to a single Firewall.
          </Typography>
        </Grid>
        <Grid item className={classes.actions}>
          <Button
            buttonType="secondary"
            onClick={() => setDeviceDrawerOpen(true)}
            superCompact
          >
            Add Linodes to Firewall
          </Button>
        </Grid>
      </Grid>
      <FirewallDevicesTable
        devices={deviceList}
        error={devices.error.read}
        lastUpdated={devices.lastUpdated}
        loading={devices.loading}
        triggerRemoveDevice={_openDialog}
      />
      <AddDeviceDrawer
        open={addDeviceDrawerOpen}
        error={addDeviceError}
        onClose={handleClose}
        addDevice={handleAddDevice}
        isSubmitting={deviceSubmitting}
        currentDevices={deviceList.map((thisDevice) => thisDevice.entity.id)}
        firewallLabel={firewallLabel}
      />
      <RemoveDeviceDialog
        open={dialog.isOpen}
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={_closeDialog}
        onRemove={handleRemoveDevice}
        deviceLabel={dialog.entityLabel ?? 'this device'}
        firewallLabel={firewallLabel}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withLinodes()
)(FirewallLinodesLanding);
