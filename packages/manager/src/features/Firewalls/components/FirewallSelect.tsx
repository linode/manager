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
   * All Firewall will show if this is omitted.
   */
  options?: Firewall[];
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
  const { errorText, hideDefaultChips, loading, value, ...rest } = props;

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const {
    defaultNumEntities,
    isDefault,
    tooltipText,
  } = useDefaultFirewallChipInformation(value, hideDefaultChips);

  const selectedFirewall = useMemo(
    () => firewalls?.find((firewall) => firewall.id === value) ?? null,
    [firewalls, value]
  );

  return (
    <Autocomplete<Firewall, false, DisableClearable>
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
      errorText={errorText ?? error?.[0].reason}
      label="Firewall"
      loading={isLoading || loading}
      noMarginTop
      options={firewalls ?? []}
      placeholder="None"
      value={selectedFirewall!}
      {...rest}
    />
  );
};
