import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
} from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';

import type { CreateNodePoolData } from '@linode/api-v4';

export const NodePoolFirewallSelect = () => {
  const { control } = useFormContext<CreateNodePoolData>();
  const { field, fieldState } = useController({
    control,
    name: 'firewall_id',
  });

  const [isUsingOwnFirewall, setIsUsingOwnFirewall] = React.useState(
    Boolean(field.value)
  );

  return (
    <Stack>
      <FormControl error={Boolean(fieldState.error)} sx={{ mt: 0 }}>
        <FormLabel sx={{ m: 0, p: 0 }}>Firewall</FormLabel>
        <RadioGroup
          aria-label="Bring your own firewall"
          onChange={(e, value) => {
            setIsUsingOwnFirewall(value === 'yes');
            field.onChange(0);
          }}
          value={isUsingOwnFirewall ? 'yes' : 'no'}
        >
          <FormControlLabel
            checked={!isUsingOwnFirewall}
            control={<Radio />}
            label="Use default firewall"
            value="no"
          />
          <FormControlLabel
            checked={isUsingOwnFirewall}
            control={<Radio />}
            label="Select existing firewall"
            value="yes"
          />
        </RadioGroup>
        {!isUsingOwnFirewall && (
          <FormHelperText sx={{ m: 0 }}>
            {fieldState.error?.message}
          </FormHelperText>
        )}
      </FormControl>
      {isUsingOwnFirewall && (
        <FirewallSelect
          errorText={fieldState.error?.message}
          noMarginTop
          onBlur={field.onBlur}
          onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
          placeholder="Select firewall"
          value={field.value}
        />
      )}
    </Stack>
  );
};
