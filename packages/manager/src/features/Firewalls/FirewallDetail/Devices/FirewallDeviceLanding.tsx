import { Button, CircleProgress, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { AddLinodeDrawer } from './AddLinodeDrawer';
import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';
import { formattedTypes } from './constants';
import { FirewallDeviceTable } from './FirewallDeviceTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceLandingProps {
  firewallId: number;
  firewallLabel: string;
  type: FirewallDeviceEntityType;
}

export const FirewallDeviceLanding = React.memo(
  (props: FirewallDeviceLandingProps) => {
    const { firewallId, firewallLabel, type } = props;
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: permissions, isLoading: isPermissionsLoading } =
      usePermissions(
        'firewall',
        ['create_firewall_device', 'delete_firewall_device'],
        firewallId
      );
    const helperText =
      'Assign one or more services to this firewall. You can add services later if you want to customize your rules first.';

    const handleClose = () => {
      navigate({
        params: { id: String(firewallId) },
        to:
          type === 'linode'
            ? '/firewalls/$id/linodes'
            : '/firewalls/$id/nodebalancers',
      });
    };

    const handleOpen = () => {
      navigate({
        params: { id: String(firewallId) },
        to:
          type === 'linode'
            ? '/firewalls/$id/linodes/add'
            : '/firewalls/$id/nodebalancers/add',
      });
    };

    const [searchText, setSearchText] = React.useState('');

    const filter = (value: string) => {
      setSearchText(value);
    };
    const [device, setDevice] = React.useState<FirewallDevice | undefined>(
      undefined
    );

    const formattedType = formattedTypes[type];
    const isCreateDeviceDisabled = !permissions.create_firewall_device;
    const isRemoveDeviceDisabled = !permissions.delete_firewall_device;

    // If the user initiates a history -/+ to a /remove route and the device is not found,
    // push navigation to the appropriate /linodes or /nodebalancers route.
    React.useEffect(() => {
      if (!device && location.pathname.endsWith('remove')) {
        navigate({
          params: { id: String(firewallId) },
          to:
            type === 'linode'
              ? '/firewalls/$id/linodes'
              : '/firewalls/$id/nodebalancers',
        });
      }
    }, [device, location.pathname, firewallId, type, navigate]);

    if (isPermissionsLoading) {
      return <CircleProgress />;
    }

    return (
      // TODO: Matching old behavior. Do we want separate messages for when the user can't create or remove devices?
      <>
        {permissions && isCreateDeviceDisabled && isRemoveDeviceDisabled ? (
          <Notice
            text={
              "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
            }
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
            container
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Grid sx={{ width: '30%' }}>
              <DebouncedSearchTextField
                debounceTime={250}
                expand={true}
                hideLabel
                label=""
                onSearch={(val) => {
                  filter(val);
                }}
                placeholder={`Search ${formattedType}s`}
                value={searchText}
              />
            </Grid>
            <Grid>
              <Button
                buttonType="primary"
                data-testid="add-device-button"
                disabled={isCreateDeviceDisabled}
                onClick={handleOpen}
              >
                Add {formattedType}s to Firewall
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <FirewallDeviceTable
          deviceType={type}
          disabled={isRemoveDeviceDisabled}
          firewallId={firewallId}
          handleRemoveDevice={(device) => {
            setDevice(device);
            navigate({
              params: { id: String(firewallId) },
              to:
                type === 'linode'
                  ? '/firewalls/$id/linodes/remove'
                  : '/firewalls/$id/nodebalancers/remove',
            });
          }}
          searchText={searchText.trim().toLowerCase()}
          type={type}
        />
        {type === 'linode' ? (
          <AddLinodeDrawer
            disabled={isCreateDeviceDisabled}
            helperText={helperText}
            onClose={handleClose}
            open={location.pathname.endsWith('add')}
          />
        ) : (
          <AddNodebalancerDrawer
            disabled={isCreateDeviceDisabled}
            helperText={helperText}
            onClose={handleClose}
            open={location.pathname.endsWith('add')}
          />
        )}
        <RemoveDeviceDialog
          device={device}
          firewallId={firewallId}
          firewallLabel={firewallLabel}
          onClose={() =>
            navigate({
              params: { id: String(firewallId) },
              to:
                type === 'linode'
                  ? '/firewalls/$id/linodes'
                  : '/firewalls/$id/nodebalancers',
            })
          }
          onService={undefined}
          open={location.pathname.endsWith('remove')}
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
