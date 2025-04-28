import { firewallQueries, useQueryClient } from '@linode/queries';
import { InputLabel, Radio, RadioGroup } from '@linode/ui';
import { Grid2 } from '@mui/material';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormGroup } from 'src/components/FormGroup';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { getDefaultFirewallForInterfacePurpose } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { InterfacePurpose } from '@linode/api-v4';

interface Props {
  index: number;
}

const interfaceTypes = [
  {
    label: 'Public Internet',
    purpose: 'public',
  },
  {
    label: 'VPC',
    purpose: 'vpc',
  },
  {
    label: 'VLAN',
    purpose: 'vlan',
  },
] as const;

export const InterfaceType = ({ index }: Props) => {
  const queryClient = useQueryClient();

  const { control, getFieldState, setValue } =
    useFormContext<LinodeCreateFormValues>();

  const { field } = useController({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  const onChange = async (value: InterfacePurpose) => {
    // Change the interface purpose (Public, VPC, VLAN)
    field.onChange(value);

    // VLAN interfaces do not support Firewalls, so set
    // the Firewall ID to `null` to be safe and early return.
    if (value === 'vlan') {
      setValue(`linodeInterfaces.${index}.firewall_id`, null);
      return;
    }

    // If the user has not touched the Firewall field...
    if (!getFieldState(`linodeInterfaces.${index}.firewall_id`).isTouched) {
      const firewallSettings = await queryClient.ensureQueryData(
        firewallQueries.settings
      );

      const defaultFirewall = getDefaultFirewallForInterfacePurpose(
        value,
        firewallSettings
      );

      // If this Interface type has a default firewall, set it
      if (defaultFirewall) {
        setValue(`linodeInterfaces.${index}.firewall_id`, defaultFirewall);
      }
    }
  };

  return (
    <FormGroup sx={{ display: 'block' }}>
      <InputLabel id="network-connection-label">Network Connection</InputLabel>
      <RadioGroup
        aria-labelledby="network-connection-label"
        sx={{ display: 'block', marginBottom: '0px !important' }}
      >
        <Grid2 container spacing={1}>
          {interfaceTypes.map((interfaceType) => (
            <SelectionCard
              checked={field.value === interfaceType.purpose}
              gridSize={{
                md: 3,
                sm: 12,
                xs: 12,
              }}
              heading={interfaceType.label}
              key={interfaceType.purpose}
              onClick={() => onChange(interfaceType.purpose)}
              renderIcon={() => (
                <Radio checked={field.value === interfaceType.purpose} />
              )}
              subheadings={[]}
              sxCardBaseIcon={{ svg: { fontSize: '24px !important' } }}
            />
          ))}
        </Grid2>
      </RadioGroup>
    </FormGroup>
  );
};
