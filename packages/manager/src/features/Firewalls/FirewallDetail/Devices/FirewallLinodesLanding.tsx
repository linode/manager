import { APIError } from '@linode/api-v4/lib/types';
import Promise from 'bluebird';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withLinodes, {
  Props as LinodesProps,
} from 'src/containers/withLinodes.container';
import AddDeviceDrawer from './AddDeviceDrawer';
import FirewallDevicesTable from './FirewallDevicesTable';
import RemoveDeviceDialog from './RemoveDeviceDialog';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallDevicesQuery,
} from 'src/queries/firewalls';

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

type CombinedProps = RouteComponentProps & Props & LinodesProps;

const FirewallLinodesLanding: React.FC<CombinedProps> = (props) => {
  const { firewallID, firewallLabel, disabled } = props;
  const classes = useStyles();

  const { data: devices, isLoading, error } = useAllFirewallDevicesQuery(
    firewallID
  );

  const { mutateAsync: addDevice } = useAddFirewallDeviceMutation(firewallID);

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
      <AddDeviceDrawer
        open={addDeviceDrawerOpen}
        error={addDeviceError}
        isSubmitting={deviceSubmitting}
        currentDevices={devices?.map((device) => device.entity.id) ?? []}
        firewallLabel={firewallLabel}
        onClose={handleClose}
        addDevice={handleAddDevice}
      />
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

export default compose<CombinedProps, Props>(
  React.memo,
  withLinodes()
)(FirewallLinodesLanding);
