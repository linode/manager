import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';

export const NodePoolFirewallSelect = () => {
  const [isUsingOwnFirewall, setIsUsingOwnFirewall] = React.useState(false);

  const { control } = useFormContext();

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
        data-testid="isUsingOwnFirewall"
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
          render={({ field }) => (
            <FirewallSelect
              //   disabled={!permissions.create_linode}
              //   errorText={fieldState.error?.message}
              onBlur={field.onBlur}
              onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
              placeholder="Select firewall"
              value={field.value}
            />
          )}
        />
      )}
    </Stack>
  );
};
