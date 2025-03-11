import { useAllFirewallsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import type { CreateInterfaceFormValues } from './utilities';

export const InterfaceFirewall = () => {
  const { field, fieldState } = useController<CreateInterfaceFormValues>({
    name: 'firewall_id',
  });

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const selectedFirewall =
    firewalls?.find((firewall) => firewall.id === field.value) ?? null;

  return (
    <Autocomplete
      errorText={fieldState.error?.message ?? error?.[0].reason}
      label="Firewall"
      loading={isLoading}
      noMarginTop
      onBlur={field.onBlur}
      onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
      options={firewalls ?? []}
      placeholder="None"
      value={selectedFirewall}
    />
  );
};
