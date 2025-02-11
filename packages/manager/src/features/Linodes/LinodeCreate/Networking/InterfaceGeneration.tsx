import { FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import type { LinodeCreateFormValues } from '../utilities';

export const InterfaceGeneration = () => {
  const { field } = useController<
    LinodeCreateFormValues,
    'interface_generation'
  >({
    name: 'interface_generation',
  });

  return (
    <RadioGroup onChange={field.onChange} value={field.value}>
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
  );
};
