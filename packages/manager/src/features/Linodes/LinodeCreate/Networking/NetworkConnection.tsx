import { FormControl, FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { getSelectedInterfaceType } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';

export const NetworkConnection = () => {
  const { field } = useController<LinodeCreateFormValues, 'interfaces.0'>({
    name: 'interfaces.0',
  });

  console.log(field);

  return (
    <FormControl>
      <FormLabel id="network-interface">Network Connection</FormLabel>
      <RadioGroup
        aria-labelledby="network-interface"
        row
        value={getSelectedInterfaceType(field.value)}
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
