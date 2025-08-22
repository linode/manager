import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';

import type { CreateNodePoolData } from '@linode/api-v4';

export interface NodePoolFirewallSelectProps {
  defaultFirewallRadioTooltip?: string;
  disableDefaultFirewallRadio?: boolean;
}

export const NodePoolFirewallSelect = (props: NodePoolFirewallSelectProps) => {
  const { defaultFirewallRadioTooltip, disableDefaultFirewallRadio } = props;
  const { control } = useFormContext<CreateNodePoolData>();
  const { field, fieldState, formState } = useController({
    control,
    name: 'firewall_id',
    rules: {
      validate: (value) => {
        if (isUsingOwnFirewall && !value && value !== 0) {
          return 'You must either select a Firewall or select the default firewall.';
        }
        return true;
      },
    },
  });

  const [isUsingOwnFirewall, setIsUsingOwnFirewall] = React.useState(
    Boolean(field.value)
  );

  return (
    <Stack>
      <FormControl error={Boolean(fieldState.error)} sx={{ mt: 0 }}>
        <FormLabel id="node-pool-firewall-label" sx={{ m: 0, p: 0 }}>
          Firewall
        </FormLabel>
        <RadioGroup
          aria-label="Bring your own firewall"
          aria-labelledby="node-pool-firewall-label"
          id="firewall-radio-group"
          onChange={(e, value) => {
            setIsUsingOwnFirewall(value === 'yes');

            if (value === 'yes') {
              // If the user chooses to use an existing firewall...
              if (formState.defaultValues?.firewall_id) {
                // If the Node Pool has a `firewall_id` set, restore that value (For the edit Node Pool flow)
                field.onChange(formState.defaultValues?.firewall_id);
              } else {
                // Set `firewall_id` to `null` so that our validation forces the user to pick a firewall or pick the default backend-generated one
                field.onChange(null);
              }
            } else {
              // Setting `firewall_id` to `0` tells the API to use the default backend-generated firewall
              field.onChange(0);
            }
          }}
          value={isUsingOwnFirewall ? 'yes' : 'no'}
        >
          <FormControlLabel
            checked={!isUsingOwnFirewall}
            control={<Radio />}
            disabled={disableDefaultFirewallRadio}
            label={
              <>
                Use default firewall
                {defaultFirewallRadioTooltip && (
                  <TooltipIcon
                    status="info"
                    text={defaultFirewallRadioTooltip}
                  />
                )}
              </>
            }
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
