import {
  useAllFirewallsQuery,
  useFirewallSettingsQuery,
} from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React, { useMemo } from 'react';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { DefaultFirewallChip } from './DefaultFirewallChip';
import { FirewallSelectOption } from './FirewallSelectOption';
import { getDefaultFirewallDescription } from './FirewallSelectOption.utils';

import type { Firewall } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

interface Props
  extends Omit<
    EnhancedAutocompleteProps<Firewall, false>,
    'label' | 'options' | 'value'
  > {
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
export const FirewallSelect = (props: Props) => {
  const { errorText, hideDefaultChips, loading, value, ...rest } = props;

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();
  const { data: firewallSettings } = useFirewallSettingsQuery({
    enabled: isLinodeInterfacesEnabled && !hideDefaultChips,
  });

  const defaultDescription =
    firewallSettings &&
    value &&
    getDefaultFirewallDescription(value, firewallSettings);

  const isDefault = !!defaultDescription;

  const selectedFirewall = useMemo(
    () => firewalls?.find((firewall) => firewall.id === value) ?? null,
    [firewalls, value]
  );

  return (
    <Autocomplete
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
            <DefaultFirewallChip tooltipText={defaultDescription} />
          ),
        },
      }}
      errorText={errorText ?? error?.[0].reason}
      label="Firewall"
      loading={isLoading || loading}
      noMarginTop
      options={firewalls ?? []}
      placeholder="None"
      value={selectedFirewall}
      {...rest}
    />
  );
};
