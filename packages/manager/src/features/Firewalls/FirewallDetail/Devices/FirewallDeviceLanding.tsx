import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

import { AddDeviceDrawer } from './AddDeviceDrawer';
import { FirewallDevicesTable } from './FirewallDevicesTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceLandingProps {
  disabled: boolean;
  firewallID: number;
  firewallLabel: string;
  type: FirewallDeviceEntityType;
}

const formattedTypes = {
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};

export const FirewallDeviceLanding = React.memo(
  (props: FirewallDeviceLandingProps) => {
    const { disabled, firewallID, firewallLabel, type } = props;

    const { data: allDevices, error, isLoading } = useAllFirewallDevicesQuery(
      firewallID
    );

    const devices =
      allDevices?.filter((device) => device.entity.type === type) || [];

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

    const formattedType = formattedTypes[type];

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
            <StyledTypography>
              The following {formattedType}s have been assigned to this
              Firewall. A {formattedType} can only be assigned to a single
              Firewall.
            </StyledTypography>
          </Grid>
          <StyledGrid>
            <Button
              buttonType="primary"
              data-testid="add-linode-button"
              disabled={disabled}
              onClick={() => setDeviceDrawerOpen(true)}
            >
              Add {formattedType}s to Firewall
            </Button>
          </StyledGrid>
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
          linodeId={selectedDevice?.entity.id}
          onClose={() => setIsRemoveDeviceDialogOpen(false)}
          open={isRemoveDeviceDialogOpen}
        />
      </>
    );
  }
);

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    fontSize: '0.875rem',
    marginTop: theme.spacing(),
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  })
);

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  '&.MuiGrid-item': {
    paddingTop: 0,
  },
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(),
  [theme.breakpoints.only('sm')]: {
    marginRight: theme.spacing(),
  },
}));
