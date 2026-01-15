import { useRegionsQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  NewFeatureChip,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React, { useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const PrivateIP = () => {
  const { field, fieldState } = useController<
    CreateLinodeRequest,
    'private_ip'
  >({
    name: 'private_ip',
  });

  const { data: regions } = useRegionsQuery();

  const { data: permissions } = usePermissions('account', ['create_linode']);

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
      disabled={isDistributedRegionSelected || !permissions.create_linode}
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
            Lets you connect with other Linodes in the same region over the data
            center&apos;s private network, without using a public IPv4 address.
          </Typography>
          <Notice variant="tip">
            <Stack alignItems="center" direction="row" spacing={1}>
              <NewFeatureChip />
              <Typography>
                You can now establish network isolation and connections to
                NodeBalancer backends through VPC. We recommend using VPC
                instead of Private IPs.
              </Typography>
            </Stack>
          </Notice>
        </Stack>
      }
      onChange={field.onChange}
      sx={{ alignItems: 'start' }}
    />
  );
};
