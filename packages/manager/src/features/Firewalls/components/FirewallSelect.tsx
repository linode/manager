import { useAllFirewallsQuery } from '@linode/queries';
import { Autocomplete, InputAdornment, Notice, Stack } from '@linode/ui';
import React, { useMemo } from 'react';

import { useDefaultFirewallChipInformation } from 'src/hooks/useDefaultFirewallChipInformation';

import { DefaultFirewallChip } from './DefaultFirewallChip';
import { FirewallSelectOption } from './FirewallSelectOption';

import type { Firewall } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

const NO_FIREWALL_ID = -1;

const noFirewallOption = {
  label: 'No firewall - traffic is unprotected (not recommended)',
  id: NO_FIREWALL_ID,
} as Firewall;

interface Props<DisableClearable extends boolean>
  extends Omit<
    EnhancedAutocompleteProps<Firewall, false, DisableClearable>,
    'label' | 'options' | 'value'
  > {
  disableClearable?: DisableClearable;
  /**
   * Hide "Default" chips showing which firewalls are defaults
   * @default false
   */
  hideDefaultChips?: boolean;
  /**
   * The label applied to the Autocomplete's TextField.
   * @default Firewall
   */
  label?: string;
  /**
   * Optionally pass your own array of Firewalls.
   * All Firewall will show if this is omitted.
   */
  options?: Firewall[];
  /**
   * Show an additional "No firewall (not recommended)" option in the dropdown, which has a value of `-1`.
   */
  showNoFirewallOption?: boolean;
  /**
   * The ID of the selected Firewall
   */
  value: null | number | undefined;
  /**
   * Warning notice when no firewall is selected.
   */
  warningMessageForNoFirewallOption?: string;
}

/**
 * A shared "Firewall Select" component intended to be used when
 * a user needs to choose a Firewall
 *
 * Currently this is only a single select, but can be extended to support more
 * Autocomplete features.
 */
export const FirewallSelect = <DisableClearable extends boolean>(
  props: Props<DisableClearable>
) => {
  const {
    errorText,
    hideDefaultChips,
    label,
    loading,
    showNoFirewallOption = true,
    value,
    warningMessageForNoFirewallOption,
    ...rest
  } = props;

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const { defaultNumEntities, isDefault, tooltipText } =
    useDefaultFirewallChipInformation(value, hideDefaultChips);

  const options = useMemo(
    () => [
      ...(firewalls ?? []),
      ...(showNoFirewallOption ? [noFirewallOption] : []),
    ],
    [firewalls, showNoFirewallOption]
  );

  const selectedFirewall = useMemo(
    () =>
      value === NO_FIREWALL_ID
        ? noFirewallOption
        : (firewalls?.find((firewall) => firewall.id === value) ?? null),
    [firewalls, value]
  );

  return (
    <Stack spacing={1}>
      <Autocomplete<Firewall, false, DisableClearable>
        aria-label={label === '' ? 'Firewall' : undefined}
        errorText={errorText ?? error?.[0].reason}
        label={label ?? 'Firewall'}
        loading={isLoading || loading}
        noMarginTop
        options={options}
        placeholder="Select a Firewall"
        renderOption={({ key, ...props }, option, state) => (
          <FirewallSelectOption
            hideDefaultChip={hideDefaultChips}
            key={key}
            listItemProps={props}
            option={option}
            state={state}
          />
        )}
        textFieldProps={{
          InputProps: {
            endAdornment: isDefault && !hideDefaultChips && (
              <InputAdornment position="end">
                <DefaultFirewallChip
                  defaultNumEntities={defaultNumEntities}
                  tooltipText={tooltipText}
                />
              </InputAdornment>
            ),
          },
        }}
        value={selectedFirewall!}
        {...rest}
      />
      {value === NO_FIREWALL_ID && warningMessageForNoFirewallOption && (
        <Notice
          spacingTop={0}
          text={warningMessageForNoFirewallOption}
          variant="warning"
        />
      )}
    </Stack>
  );
};
