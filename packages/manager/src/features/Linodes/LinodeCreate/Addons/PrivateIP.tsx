import { useRegionsQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React, { useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const PrivateIP = () => {
  const { field, fieldState } = useController<
    CreateLinodeRequest,
    'private_ip'
  >({
    name: 'private_ip',
  });

  const { data: regions } = useRegionsQuery();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const regionId = useWatch<CreateLinodeRequest, 'region'>({ name: 'region' });

  const selectedRegion = useMemo(
    () => regions?.find((r) => r.id === regionId),
    [regions, regionId]
  );

  const isDistributedRegionSelected =
    selectedRegion?.site_type === 'distributed';

  return (
    <FormControlLabel
      checked={field.value ?? false}
      control={
        <Checkbox sx={(theme) => ({ mt: `-${theme.tokens.spacing.S8}` })} />
      }
      disabled={isDistributedRegionSelected || isLinodeCreateRestricted}
      label={
        <Stack spacing={1} sx={{ pl: 2 }}>
          <Typography component="span" variant="h3">
            Private IP
          </Typography>
          {fieldState.error?.message && (
            <Notice
              sx={{ width: 'fit-content' }}
              text={fieldState.error.message}
              variant="error"
            />
          )}
          <Typography component="span" display="block" variant="body1">
            Use Private IP for a backend node to a NodeBalancer. Use VPC instead
            for private communication between your Linodes.
          </Typography>
        </Stack>
      }
      onChange={field.onChange}
      sx={{ alignItems: 'start' }}
    />
  );
};
