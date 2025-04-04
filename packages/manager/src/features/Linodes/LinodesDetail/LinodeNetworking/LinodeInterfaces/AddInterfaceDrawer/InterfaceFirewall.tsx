import React from 'react';
import { useController } from 'react-hook-form';

import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';

import type { CreateInterfaceFormValues } from './utilities';

export const InterfaceFirewall = () => {
  const { field, fieldState } = useController<
    CreateInterfaceFormValues,
    'firewall_id'
  >({
    name: 'firewall_id',
  });

  return (
    <FirewallSelect
      errorText={fieldState.error?.message}
      onBlur={field.onBlur}
      onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
      placeholder="None"
      value={field.value}
    />
  );
};
