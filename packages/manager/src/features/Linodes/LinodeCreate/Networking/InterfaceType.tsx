import { useFirewallSettingsQuery } from '@linode/queries';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { getDefaultFirewallForInterfacePurpose } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { InterfacePurpose } from '@linode/api-v4';

interface Props {
  index: number;
}

export const InterfaceType = ({ index }: Props) => {
  const { control, setValue } = useFormContext<LinodeCreateFormValues>();

  const { data: firewallSettings } = useFirewallSettingsQuery();

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
        onChange={(e, value) => {
          // Change the interface purpose (Public, VPC, VLAN)
          field.onChange(value);

          // Set the Firewall based on defaults
          setValue(
            `linodeInterfaces.${index}.firewall_id`,
            getDefaultFirewallForInterfacePurpose(
              value as InterfacePurpose,
              firewallSettings
            )
          );
        }}
        aria-labelledby="network-interface"
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
