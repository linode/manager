import { Button, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

import { AddLinodeDrawer } from './AddLinodeDrawer';
import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';
import { FirewallDeviceTable } from './FirewallDeviceTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceLandingProps {
  disabled: boolean;
  firewallId: number;
  firewallLabel: string;
  type: FirewallDeviceEntityType;
}

export const formattedTypes: Record<FirewallDeviceEntityType, string> = {
  interface: 'Interface', // @TODO Linode Interface: double check this when working on UI tickets
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};

export const FirewallDeviceLanding = React.memo(
  (props: FirewallDeviceLandingProps) => {
    const { disabled, firewallId, firewallLabel, type } = props;

    const { data: allDevices, error, isLoading } = useAllFirewallDevicesQuery(
      firewallId
    );

    const theme = useTheme();

    const location = useLocation();
    const navigate = useNavigate();
    const helperText =
      'Assign one or more services to this firewall. You can add services later if you want to customize your rules first.';

    React.useEffect(() => {
      if (location.pathname.endsWith('add')) {
        setDeviceDrawerOpen(true);
      }
    }, [location.pathname]);

    const devices =
      allDevices?.filter((device) => device.entity.type === type) || [];

    const [filteredDevices, setFilteredDevices] = React.useState<
      FirewallDevice[]
    >([]);

    React.useEffect(() => {
      setFilteredDevices(devices);
    }, [allDevices]);

    const [
      isRemoveDeviceDialogOpen,
      setIsRemoveDeviceDialogOpen,
    ] = React.useState<boolean>(false);

    const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(-1);

    const selectedDevice = filteredDevices?.find(
      (device) => device.id === selectedDeviceId
    );

    const [addDeviceDrawerOpen, setDeviceDrawerOpen] = React.useState<boolean>(
      false
    );

    const handleClose = () => {
      setDeviceDrawerOpen(false);
      navigate({ to: location.pathname });
    };

    const handleOpen = () => {
      setDeviceDrawerOpen(true);
      navigate({ to: location.pathname + '/add' });
    };

    const [searchText, setSearchText] = React.useState('');

    const filter = (value: string) => {
      setSearchText(value);
      const filtered = devices?.filter((device) => {
        return device.entity.label.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredDevices(filtered ?? []);
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
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            container
            direction="row"
          >
            <Grid sx={{ width: '30%' }}>
              <DebouncedSearchTextField
                onSearch={(val) => {
                  filter(val);
                }}
                debounceTime={250}
                expand={true}
                hideLabel
                label=""
                placeholder={`Search ${formattedType}s`}
                value={searchText}
              />
            </Grid>
            <Grid>
              <Button
                buttonType="primary"
                data-testid="add-device-button"
                disabled={disabled}
                onClick={handleOpen}
              >
                Add {formattedType}s to Firewall
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <FirewallDeviceTable
          triggerRemoveDevice={(id) => {
            setSelectedDeviceId(id);
            setIsRemoveDeviceDialogOpen(true);
          }}
          deviceType={type}
          devices={filteredDevices ?? []}
          disabled={disabled}
          error={error ?? undefined}
          loading={isLoading}
        />
        {type === 'linode' ? (
          <AddLinodeDrawer
            helperText={helperText}
            onClose={handleClose}
            open={addDeviceDrawerOpen}
          />
        ) : (
          <AddNodebalancerDrawer
            helperText={helperText}
            onClose={handleClose}
            open={addDeviceDrawerOpen}
          />
        )}
        <RemoveDeviceDialog
          device={selectedDevice}
          firewallId={firewallId}
          firewallLabel={firewallLabel}
          onClose={() => setIsRemoveDeviceDialogOpen(false)}
          onService={undefined}
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
