import {
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

export const ClusterNetworkingPanel = () => {
  const { isLkeEnterprisePhase2FeatureEnabled } = useIsLkeEnterpriseEnabled();

  const { control } = useFormContext();

  return isLkeEnterprisePhase2FeatureEnabled ? (
    <>
      <Stack divider={<Divider />} spacing={4}>
        <Controller
          control={control}
          name="stack_type"
          render={({ field }) => (
            <RadioGroup
              {...field}
              onChange={(e) => field.onChange(e.target.value)}
              value={field.value ?? null}
            >
              <FormLabel>IP Version</FormLabel>
              <FormControlLabel control={<Radio />} label="IPv4" value="ipv4" />
              <FormControlLabel
                control={<Radio />}
                label="IPv4 + IPv6"
                value="ipv4-ipv6"
              />
            </RadioGroup>
          )}
        />
      </Stack>
      <Stack marginTop={3}>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          VPC
        </Typography>
        <Typography marginTop={1}>
          Allow for private communications within and across clusters in the
          same data center.
        </Typography>
      </Stack>
    </>
  ) : (
    <Stack>
      <Typography variant="h3">VPC & Firewall</Typography>
      <Typography marginTop={1}>
        A VPC and Firewall are automatically generated for LKE Enterprise
        customers.
      </Typography>
    </Stack>
  );
};
