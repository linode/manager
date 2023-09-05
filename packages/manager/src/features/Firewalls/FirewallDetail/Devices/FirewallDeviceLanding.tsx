import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

import { AddDeviceDrawer } from './AddDeviceDrawer';
import { FirewallDevicesTable } from './FirewallDevicesTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

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

    const theme = useTheme();

    const devices =
      allDevices?.filter((device) => device.entity.type === type) || [];

    const [filteredDevices, setFilteredDevices] = React.useState<
      FirewallDevice[]
    >(devices);

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

    const [searchText, setSearchText] = React.useState('');

    const filter = (value: string) => {
      setSearchText(value);
      const filtered = devices.filter((device) => {
        return device.entity.label.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredDevices(filtered);
    };

    const formattedType = formattedTypes[type];

    return (
      <>
        {disabled ? (
          <Notice
            text={
              "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
            }
            important
            variant="error"
          />
        ) : null}
        <Grid
          container
          direction="column"
          sx={{ marginBottom: theme.spacing(2) }}
        >
          <StyledTypography>
            The following {formattedType}s have been assigned to this Firewall.
            A {formattedType} can only be assigned to a single Firewall.
          </StyledTypography>
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="space-between"
          >
            <Grid sx={{ width: '30%' }}>
              <DebouncedSearchTextField
                onSearch={(val) => {
                  filter(val);
                }}
                expand={true}
                placeholder={`Search ${formattedType}s`}
                value={searchText}
              />
            </Grid>
            <Grid>
              <Button
                buttonType="primary"
                data-testid="add-device-button"
                disabled={disabled}
                onClick={() => setDeviceDrawerOpen(true)}
              >
                Add {formattedType}s to Firewall
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <FirewallDevicesTable
          triggerRemoveDevice={(id) => {
            setSelectedDeviceId(id);
            setIsRemoveDeviceDialogOpen(true);
          }}
          devices={filteredDevices ?? []}
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
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(),
  })
);
