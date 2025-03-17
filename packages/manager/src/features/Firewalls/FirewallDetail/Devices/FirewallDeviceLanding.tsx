import { Button, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled, useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';

import { AddLinodeDrawer } from './AddLinodeDrawer';
import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';
import { formattedTypes } from './constants';
import { FirewallDeviceTable } from './FirewallDeviceTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceLandingProps {
  disabled: boolean;
  firewallId: number;
  firewallLabel: string;
  type: FirewallDeviceEntityType;
}

export const FirewallDeviceLanding = React.memo(
  (props: FirewallDeviceLandingProps) => {
    const { disabled, firewallId, firewallLabel, type } = props;
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
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
          deviceType={type}
          disabled={disabled}
          firewallId={firewallId}
          type={type}
        />
        {type === 'linode' ? (
          <AddLinodeDrawer
            helperText={helperText}
            onClose={handleClose}
            open={location.pathname.endsWith('add')}
          />
        ) : (
          <AddNodebalancerDrawer
            helperText={helperText}
            onClose={handleClose}
            open={location.pathname.endsWith('add')}
          />
        )}
        <RemoveDeviceDialog
          onClose={() =>
            navigate({
              params: { id: String(firewallId) },
              to:
                type === 'linode'
                  ? '/firewalls/$id/linodes'
                  : '/firewalls/$id/nodebalancers',
            })
          }
          device={device}
          firewallId={firewallId}
          firewallLabel={firewallLabel}
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
