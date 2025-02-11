import { FormControl, FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import type { LinodeCreateFormValues } from '../utilities';

export const NetworkConnection = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const { field } = useController({
    control,
    name: 'interfaceType',
  });

  return (
    <FormControl>
      <FormLabel id="network-interface">Network Connection</FormLabel>
      <RadioGroup
        aria-labelledby="network-interface"
        onChange={field.onChange}
        row
        value={field.value}
      >
        <FormControlLabel
          control={<Radio />}
          label="Public Internet"
          value="public"
        />
        <FormControlLabel control={<Radio />} label="VPC" value="vpc" />
        <FormControlLabel control={<Radio />} label="VLAN" value="vlan" />
      </RadioGroup>
    </FormControl>
  );
};
