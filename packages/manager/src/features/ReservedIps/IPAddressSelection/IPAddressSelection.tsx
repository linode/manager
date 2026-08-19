import { Badge } from '@akamai/cds-components/react';
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
import React from 'react';
import type { ChangeEvent } from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { ReserveIPDrawer } from 'src/features/ReservedIps/ReserveIPDrawer';

import type { IPAddress } from '@linode/api-v4';
import type { SxProps, Theme } from '@linode/ui';

type IPAddressMode = 'auto' | 'reserved';

// Thin wrapper to make IPAddress compatible with Autocomplete's label requirement
type IPAddressOption = IPAddress & { label: string };

export interface IPAddressSelectionProps {
  /**
   * Whether the component should be disabled. Used when region is not selected in parent form.
   */
  disabled?: boolean;
  /**
   * Error message to display below the Autocomplete field
   */
  error?: string;
  /**
   * Header label for the selection component
   */
  label?: string;
  /**
   * Controlled value for IP mode - drives the radio selection
   */
  mode?: IPAddressMode;
  /**
   * Callback fired when the IP mode changes (auto vs reserved)
   */
  onIPModeChange?: (mode: IPAddressMode) => void;
  /**
   * Callback fired when a reserved IP is selected
   */
  onReservedIPSelect?: (ip: IPAddress | null) => void;
  /**
   * Optional Pendo tracking IDs for the radio buttons.
   */
  pendoIds?: {
    auto: string;
    cancelReserveIPDrawer: string;
    closeReserveIPDrawer: string;
    reserved: string;
    reserveIPAutocomplete: string;
    reserveIPAutocompleteOptions: string;
    reserveIPLink: string;
    submitReserveIPDrawer: string;
  };
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
   * Whether to show a "New" badge next to the label
   */
  showNewBadge?: boolean;
  /**
   * Custom tooltip text for auto and reserved options
   */
  /**
   * Optional sx prop for the label
   */
  sxLabel?: SxProps<Theme>;
  tooltipText?: {
    auto: string;
    reserved: string;
  };
}

/**
 * Reusable IP Address Selection component
 *
 * Allows users to choose between auto-assigned and reserved IP addresses.
 * Can be used in Linode Create, NodeBalancer Create, or any other flow
 * that supports reserved IPs.
 */
export const IPAddressSelection = ({
  disabled = false,
  error,
  label = 'IP Address',
  sxLabel,
  mode = 'auto',
  onIPModeChange,
  onReservedIPSelect,
  pendoIds,
  regionId,
  selectedIP = null,
  showNewBadge = false,
  tooltipText = {
    auto: "A public IPv4 address automatically assigned to your Linode. \
      Use this for standard web traffic that doesn't require a permanent, static IP. \
      This address is included at no additional cost but may change if the Linode is deleted.",
    reserved:
      "A reserved IPv4 address is a static public IP that can be assigned to \
      Linodes in the same region. Use it for services that require a consistent IP address. \
      Charges apply while the IP is reserved, even if it's not assigned to a Linode.",
  },
}: IPAddressSelectionProps) => {
  const [isReserveIPDrawerOpen, setIsReserveIPDrawerOpen] =
    React.useState(false);

  const {
    data: reservedIPs,
    isLoading,
    refetch,
  } = useReservedIPsQuery({}, {}, mode === 'reserved' && Boolean(regionId));

  const unassignedReservedIPs = React.useMemo<IPAddressOption[]>(() => {
    if (!reservedIPs?.data) {
      return [];
    }

    return reservedIPs.data
      .filter(
        (ip: IPAddress) => ip.assigned_entity === null && ip.region === regionId
      )
      .map((ip: IPAddress) => ({ ...ip, label: ip.address }));
  }, [reservedIPs, regionId]);

  const handleModeChange = (newMode: IPAddressMode) => {
    onIPModeChange?.(newMode);
  };

  return (
    <FormControl>
      <Box alignItems="center" display="flex" flexDirection="row">
        <FormLabel id="ip-address-label" sx={sxLabel}>
          {label} {showNewBadge && <Badge type="new">New</Badge>}
        </FormLabel>
      </Box>
      <RadioGroup
        aria-labelledby="ip-address-label"
        onChange={(_: ChangeEvent, value: IPAddressMode) =>
          handleModeChange(value)
        }
        value={mode}
      >
        <FormControlLabel
          control={<Radio />}
          data-pendo-id={pendoIds?.auto}
          data-qa-ip-mode-option="auto"
          disabled={disabled}
          key="auto"
          label={
            <Stack direction="row" mt={1.25} spacing={0.5}>
              <Typography>Auto-assigned</Typography>
              <TooltipIcon
                status="info"
                sxTooltipIcon={{ p: 0, ml: 0.5 }}
                text={tooltipText.auto}
                tooltipPosition="right"
              />
            </Stack>
          }
          sx={{ alignItems: 'flex-start' }}
          value="auto"
        />
        <FormControlLabel
          control={<Radio />}
          data-pendo-id={pendoIds?.reserved}
          data-qa-ip-mode-option="reserved"
          disabled={disabled}
          key="reserved"
          label={
            <Stack direction="row" mt={1.25} spacing={0.5}>
              <Typography>Reserved</Typography>
              <TooltipIcon
                status="info"
                sxTooltipIcon={{ p: 0, ml: 0.5 }}
                text={tooltipText.reserved}
                tooltipPosition="right"
              />
            </Stack>
          }
          sx={{ alignItems: 'flex-start' }}
          value="reserved"
        />
      </RadioGroup>
      {mode === 'reserved' && (
        <Box ml={3}>
          <Autocomplete
            disabled={!regionId}
            errorText={error}
            getOptionLabel={(option: IPAddressOption) => option.address}
            helperText={
              !regionId
                ? 'Select a region to see available reserved IPs.'
                : undefined
            }
            isOptionEqualToValue={(
              option: IPAddressOption,
              value: IPAddressOption
            ) => option.address === value.address}
            label="Reserved IP Address"
            loading={isLoading}
            noOptionsText={
              'There are no available reserved IPs in the selected region.'
            }
            onChange={(
              _: React.SyntheticEvent,
              selectedOption: IPAddressOption | null
            ) => {
              onReservedIPSelect?.(selectedOption);
            }}
            options={unassignedReservedIPs}
            placeholder="Select"
            renderOption={(props, option) => (
              <li
                {...props}
                data-pendo-id={pendoIds?.reserveIPAutocompleteOptions}
                key={option.address}
              >
                {option.address}
              </li>
            )}
            sx={{ width: 300 }}
            textFieldProps={{
              hideLabel: true,
              inputProps: {
                'data-pendo-id': pendoIds?.reserveIPAutocomplete,
              },
            }}
            value={
              selectedIP ? { ...selectedIP, label: selectedIP.address } : null
            }
          />
          <Box mt={1}>
            <StyledLinkButtonBox>
              <LinkButton
                data-pendo-id={pendoIds?.reserveIPLink}
                onClick={() => setIsReserveIPDrawerOpen(true)}
              >
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
        pendoIds={{
          cancel: pendoIds?.cancelReserveIPDrawer,
          close: pendoIds?.closeReserveIPDrawer,
          submit: pendoIds?.submitReserveIPDrawer,
        }}
        region={regionId}
      />
    </FormControl>
  );
};
