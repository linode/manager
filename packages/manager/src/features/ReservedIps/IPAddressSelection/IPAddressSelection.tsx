import { useReservedIPsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  LinkButton,
  Radio,
  RadioGroup,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React, { ChangeEvent } from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { ReserveIPDrawer } from 'src/features/ReservedIps/ReserveIPDrawer';

import type { IPAddress } from '@linode/api-v4';

type IPAddressMode = 'auto' | 'reserved';

interface ReservedIPOption {
  address: string;
  ip: IPAddress;
  label: string;
  region: string;
}

export interface IPAddressSelectionProps {
  /**
   * Callback fired when the IP mode changes (auto vs reserved)
   */
  onIPModeChange?: (mode: IPAddressMode) => void;
  /**
   * Callback fired when a reserved IP is selected
   */
  onReservedIPSelect?: (ip: IPAddress | null) => void;
  /**
   * The currently selected region ID
   */
  regionId?: string;
  /**
   * The currently selected reserved IP address (controlled)
   * Used to restore selection when component remounts
   */
  selectedIP?: IPAddress | null;
  /**
   * Initial value for IP mode
   */
  value?: IPAddressMode;
}

/**
 * Reusable IP Address Selection component
 *
 * Allows users to choose between auto-assigned and reserved IP addresses.
 * Can be used in Linode Create, NodeBalancer Create, or any other flow
 * that supports reserved IPs.
 */
export const IPAddressSelection = ({
  onIPModeChange,
  onReservedIPSelect,
  regionId,
  selectedIP = null,
  value = 'auto',
}: IPAddressSelectionProps) => {
  const [isReserveIPDrawerOpen, setIsReserveIPDrawerOpen] =
    React.useState(false);

  const {
    data: reservedIPs,
    isLoading,
    refetch,
  } = useReservedIPsQuery({}, {}, value === 'reserved' && Boolean(regionId));

  const unassignedReservedIPs = React.useMemo<ReservedIPOption[]>(() => {
    if (!reservedIPs?.data) {
      return [];
    }

    return reservedIPs.data
      .filter(
        (ip: IPAddress) => ip.assigned_entity === null && ip.region === regionId
      )
      .map((ip: IPAddress) => ({
        address: ip.address,
        ip,
        label: ip.address,
        region: ip.region,
      }));
  }, [reservedIPs, regionId]);

  // Derive the Autocomplete option from the controlled selectedIP prop
  // so the selection is restored when the component remounts.
  const selectedOption = React.useMemo<null | ReservedIPOption>(() => {
    if (!selectedIP) {
      return null;
    }
    return {
      address: selectedIP.address,
      ip: selectedIP,
      label: selectedIP.address,
      region: selectedIP.region,
    };
  }, [selectedIP]);

  const handleModeChange = (mode: IPAddressMode) => {
    onIPModeChange?.(mode);
  };

  return (
    <FormControl>
      <Box alignItems="center" display="flex" flexDirection="row" mt={1}>
        <FormLabel id="ip-address-label">IP Address</FormLabel>
      </Box>
      <RadioGroup
        aria-labelledby="ip-address-label"
        onChange={(_: ChangeEvent, value: IPAddressMode) =>
          handleModeChange(value)
        }
        value={value}
      >
        <FormControlLabel
          control={<Radio />}
          data-qa-ip-mode-option="auto"
          key="auto"
          label={
            <Stack direction="row" mt={1.25} spacing={0.5}>
              <Typography>Auto-assigned</Typography>
              <TooltipIcon
                status="info"
                sxTooltipIcon={{ p: 0, ml: 0.5 }}
                text="A public IPv4 address automatically assigned to your Linode. Use this for standard web traffic that doesn't require a permanent, static IP."
                tooltipPosition="right"
              />
            </Stack>
          }
          sx={{ alignItems: 'flex-start' }}
          value="auto"
        />
        <FormControlLabel
          control={<Radio />}
          data-qa-ip-mode-option="reserved"
          key="reserved"
          label={
            <Stack direction="row" mt={1.25} spacing={0.5}>
              <Typography>Reserved</Typography>
              <TooltipIcon
                status="info"
                sxTooltipIcon={{ p: 0, ml: 0.5 }}
                text="A reserved IPv4 address is a static public IP that can be assigned to Linodes in the same region. Use it for services that require a consistent IP address. Charges apply while the IP is reserved, even if it's not assigned to a Linode."
                tooltipPosition="right"
              />
            </Stack>
          }
          sx={{ alignItems: 'flex-start' }}
          value="reserved"
        />
      </RadioGroup>
      {value === 'reserved' && (
        <Box ml={3} mt={1}>
          <Autocomplete
            disabled={!regionId}
            helperText={
              !regionId
                ? 'Select a region to see available reserved IPs.'
                : undefined
            }
            isOptionEqualToValue={(
              option: ReservedIPOption,
              value: ReservedIPOption
            ) => option.address === value.address}
            label="Reserved IP Address"
            loading={isLoading}
            noOptionsText={
              regionId
                ? 'There are no available reserved IPs in the selected region.'
                : 'Select a region first.'
            }
            onChange={(
              _: React.SyntheticEvent,
              selectedOption: null | ReservedIPOption
            ) => {
              onReservedIPSelect?.(selectedOption?.ip ?? null);
            }}
            options={unassignedReservedIPs}
            placeholder="Select"
            textFieldProps={{
              hideLabel: true,
            }}
            value={selectedOption}
          />
          <Box mt={1}>
            <StyledLinkButtonBox>
              <LinkButton onClick={() => setIsReserveIPDrawerOpen(true)}>
                Reserve IP
              </LinkButton>
            </StyledLinkButtonBox>
          </Box>
        </Box>
      )}

      <ReserveIPDrawer
        mode="create"
        onClose={() => setIsReserveIPDrawerOpen(false)}
        onSuccess={(ip: IPAddress) => {
          // Refetch the reserved IPs list to include the newly created IP
          refetch();
          // Auto-select the newly reserved IP if it's in the current region
          if (ip.region === regionId) {
            onReservedIPSelect?.(ip);
          }
        }}
        open={isReserveIPDrawerOpen}
        region={regionId}
      />
    </FormControl>
  );
};
