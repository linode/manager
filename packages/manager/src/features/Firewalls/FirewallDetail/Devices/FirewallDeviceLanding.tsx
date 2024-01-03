import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
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

export const formattedTypes = {
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

    const history = useHistory();
    const routeMatch = useRouteMatch();
    const location = useLocation();

    const flags = useFlags();
    const entityName = flags.firewallNodebalancer ? 'services' : 'Linodes';
    const helperText = `Assign one or more ${entityName} to this firewall. You can add ${entityName} later if you want to customize your rules first.`;

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
      history.push(routeMatch.url);
    };

    const handleOpen = () => {
      setDeviceDrawerOpen(true);
      history.push(routeMatch.url + '/add');
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
