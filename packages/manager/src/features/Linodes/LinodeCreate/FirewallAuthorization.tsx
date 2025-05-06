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

  const [legacyFirewallId, linodeInterfaces, interfaceGeneration] = useWatch({
    name: ['firewall_id', 'linodeInterfaces', 'interface_generation'],
    control,
  });

  // Handle Linode Interfaces
  if (interfaceGeneration === 'linode') {
    // VLAN Linode interfaces do not support Firewalls, so we don't consider them.
    const interfacesThatMayHaveInternetConnectivity = linodeInterfaces.filter(
      (i) => i.purpose !== 'vlan'
    );

    // If every interface that could have internet connectivity has a Firewall,
    // we can early return (Not show the notice to the user)
    if (interfacesThatMayHaveInternetConnectivity.every((i) => i.firewall_id)) {
      return null;
    }
  }
  // Handle legacy Interfaces
  else if (legacyFirewallId) {
    // Firewall is selected, so we can early return. (Not show the notice to the user)
    return null;
  }

  if (!(fieldState.isDirty || fieldState.error)) {
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
