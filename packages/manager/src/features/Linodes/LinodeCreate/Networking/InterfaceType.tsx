import { FormControl, FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const InterfaceType = ({ index }: Props) => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const { field } = useController({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  return (
    <FormControl>
      <FormLabel id="network-interface" sx={{ mb: 0 }}>
        Network Connection
      </FormLabel>
      <RadioGroup
        aria-labelledby="network-interface"
        onChange={field.onChange}
        row
        sx={{ mb: '0px !important' }}
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
