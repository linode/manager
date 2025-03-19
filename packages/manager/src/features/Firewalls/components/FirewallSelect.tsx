import { useAllFirewallsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { Firewall } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

interface Props
  extends Omit<
    EnhancedAutocompleteProps<Firewall, false>,
    'label' | 'options' | 'value'
  > {
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
 *
 * @TODO Linode Interfaces - Add default chip functionality
 */
export const FirewallSelect = (props: Props) => {
  const { errorText, loading, value, ...rest } = props;
  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const selectedFirewall =
    firewalls?.find((firewall) => firewall.id === value) ?? null;

  return (
    <Autocomplete
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
