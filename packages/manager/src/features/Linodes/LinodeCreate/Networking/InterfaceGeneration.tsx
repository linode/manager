import { useAccountSettings } from '@linode/queries';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import type { LinodeCreateFormValues } from '../utilities';
import type { LinodeInterfaceAccountSetting } from '@linode/api-v4';

const disabledReasonMap: Partial<
  Record<LinodeInterfaceAccountSetting, string>
> = {
  legacy_config_only:
    'You account administrator has enforced that all new Linodes are created with legacy configuration interfaces.',
  linode_only:
    'You account administrator has enforced that all new Linodes are created with Linode interfaces.',
};

export const InterfaceGeneration = () => {
  const { field } = useController<
    LinodeCreateFormValues,
    'interface_generation'
  >({
    name: 'interface_generation',
  });

  const { data: accountSettings } = useAccountSettings();

  const disabledReason =
    accountSettings &&
    disabledReasonMap[accountSettings.interfaces_for_new_linodes];

  return (
    <FormControl disabled={Boolean(disabledReason)}>
      <FormLabel
        id="interface-generation"
        sx={{ alignItems: 'center', display: 'flex', mb: 0 }}
      >
        Interface Generation
        {disabledReason && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ p: 0.5 }}
            text={disabledReason}
          />
        )}
      </FormLabel>
      <RadioGroup
        aria-labelledby="interface-generation"
        onChange={field.onChange}
        value={field.value ?? 'legacy_config'}
      >
        <FormControlLabel
          control={<Radio />}
          label="Configuration Profile Interfaces (Legacy)"
          value="legacy_config"
        />
        <FormControlLabel
          control={<Radio />}
          label="Linode Interfaces (New)"
          value="linode"
        />
      </RadioGroup>
    </FormControl>
  );
};
