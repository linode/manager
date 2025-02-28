import { FormControl, FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import type { LinodeCreateFormValues } from '../utilities';

export const InterfaceGeneration = () => {
  const { field } = useController<
    LinodeCreateFormValues,
    'interface_generation'
  >({
    name: 'interface_generation',
  });

  return (
    <FormControl>
      <FormLabel id="interface-generation" sx={{ mb: 0 }}>
        Interface Generation
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
