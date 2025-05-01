import { Checkbox, FormControlLabel } from '@linode/ui';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { useFlags } from 'src/hooks/useFlags';

import type { LinodeCreateFormValues } from './utilities';

export const FirewallAuthorization = () => {
  const flags = useFlags();

  const { control } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController({
    control,
    name: 'firewallOverride',
  });

  const [
    legacyFirewallId,
    firstLinodeInterfaceFirewallId,
    interfaceGeneration,
  ] = useWatch({
    name: [
      'firewall_id',
      'linodeInterfaces.0.firewall_id',
      'interface_generation',
    ],
    control,
  });

  const firewallId =
    interfaceGeneration === 'linode'
      ? firstLinodeInterfaceFirewallId
      : legacyFirewallId;

  if (firewallId || !(fieldState.isDirty || fieldState.error)) {
    return null;
  }

  return (
    <AkamaiBanner
      action={
        <FormControlLabel
          checked={field.value ?? false}
          className="error-for-scroll"
          control={<Checkbox />}
          disableTypography
          label={
            flags.secureVmCopy?.firewallAuthorizationLabel ??
            'I am authorized to create a Linode without a firewall'
          }
          onChange={field.onChange}
          sx={{ fontSize: 14 }}
        />
      }
      text={
        flags.secureVmCopy?.firewallAuthorizationWarning ??
        'Linodes must have a firewall enabled.'
      }
      warning
    />
  );
};
