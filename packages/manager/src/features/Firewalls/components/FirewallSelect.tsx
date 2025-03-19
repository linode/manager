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
  label?: string;
  options?: Firewall[];
  value: null | number | undefined;
}

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
