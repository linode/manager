import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { Checkbox } from 'src/components/Checkbox';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { useFlags } from 'src/hooks/useFlags';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

import type { LinodeCreateFormValues } from './utilities';

export const FirewallAuthorization = () => {
  const flags = useFlags();
  const { control, watch } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'firewallOverride',
  });

  const watchFirewall = watch('firewall_id');

  if (
    isNotNullOrUndefined(watchFirewall) ||
    !(fieldState.isDirty || fieldState.error)
  ) {
    return;
  }

  return (
    <AkamaiBanner
      action={
        <FormControlLabel
          label={
            flags.secureVmCopy?.firewallAuthorizationLabel ??
            'I am authorized to create a Linode without a firewall'
          }
          checked={field.value ?? false}
          className="error-for-scroll"
          control={<Checkbox />}
          disableTypography
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
