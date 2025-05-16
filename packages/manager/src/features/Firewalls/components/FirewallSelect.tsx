import { useAllFirewallsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React, { useMemo } from 'react';

import { useDefaultFirewallChipInformation } from 'src/hooks/useDefaultFirewallChipInformation';

import { DefaultFirewallChip } from './DefaultFirewallChip';
import { FirewallSelectOption } from './FirewallSelectOption';

import type { Firewall } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

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
   * All Firewalls will show if this is omitted.
   */
  options?: Firewall[];
  /**
   * Determine which firewalls should be available as options.
   * If the options prop is used, this is filter ignored.
   */
  optionsFilter?: (firewall: Firewall) => boolean;
  /**
   * The ID of the selected Firewall
   */
  value: null | number | undefined;
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
    loading,
    value,
    options,
    optionsFilter,
    ...rest
  } = props;

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery(!options);

  const firewallOptions =
    options || (optionsFilter ? firewalls?.filter(optionsFilter) : firewalls);

  const { defaultNumEntities, isDefault, tooltipText } =
    useDefaultFirewallChipInformation(value, hideDefaultChips);

  const selectedFirewall = useMemo(
    () => firewalls?.find((firewall) => firewall.id === value) ?? null,
    [firewalls, value]
  );

  return (
    <Autocomplete<Firewall, false, DisableClearable>
      errorText={errorText ?? error?.[0].reason}
      label="Firewall"
      loading={isLoading || loading}
      noMarginTop
      options={firewallOptions ?? []}
      placeholder="None"
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
            <DefaultFirewallChip
              defaultNumEntities={defaultNumEntities}
              tooltipText={tooltipText}
            />
          ),
        },
      }}
      value={selectedFirewall!}
      {...rest}
    />
  );
};
