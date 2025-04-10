import { Checkbox, FormControlLabel } from '@linode/ui';
import { isNotNullOrUndefined } from '@linode/utilities';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { useFlags } from 'src/hooks/useFlags';

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
          checked={field.value ?? false}
          className="error-for-scroll"
          control={<Checkbox />}
          disableTypography
          label={
            flags.secureVmCopy?.firewallAuthorizationLabel ??
            'I am authorized to create a Linode without a firewall'
          }
          onChange={field.onChange}
          sx={(theme) => ({ fontSize: theme.tokens.font.FontSize.Xs })}
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
