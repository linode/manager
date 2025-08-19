import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';

import type { CreateNodePoolData } from '@linode/api-v4';

export const NodePoolFirewallSelect = () => {
  const { control } = useFormContext<CreateNodePoolData>();
  const watchedFirewallId = useWatch({ control, name: 'firewall_id' });

  const [isUsingOwnFirewall, setIsUsingOwnFirewall] = React.useState(
    Boolean(watchedFirewallId)
  );

  return (
    <Stack marginTop={3}>
      <Typography
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Bold.S,
        })}
      >
        Firewall
      </Typography>
      <RadioGroup
        aria-label="Bring your own firewall"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setIsUsingOwnFirewall(e.target.value === 'yes');
        }}
        value={isUsingOwnFirewall}
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
      {isUsingOwnFirewall && (
        <Controller
          control={control}
          name="firewall_id"
          render={({ field, fieldState }) => (
            <FirewallSelect
              errorText={fieldState.error?.message}
              onBlur={field.onBlur}
              onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
              placeholder="Select firewall"
              value={field.value}
            />
          )}
          rules={{
            validate: (value) => {
              if (isUsingOwnFirewall && !value) {
                return 'You must either select a Firewall or select the default firewall.';
              }
              return true;
            },
          }}
        />
      )}
    </Stack>
  );
};
