import React from 'react';
import { useController } from 'react-hook-form';

import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { WARNING_MESSAGE_FOR_NO_FIREWALL_OPTION } from 'src/features/Linodes/constants';

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
      placeholder="Select a Firewall"
      value={field.value}
      warningMessageForNoFirewallOption={WARNING_MESSAGE_FOR_NO_FIREWALL_OPTION}
    />
  );
};
