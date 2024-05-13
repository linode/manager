import React, { useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { Checkbox } from 'src/components/Checkbox';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const PrivateIP = () => {
  const { field } = useController<CreateLinodeRequest, 'private_ip'>({
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
    selectedRegion?.site_type === 'distributed' ||
    selectedRegion?.site_type === 'edge';

  return (
    <FormControlLabel
      label={
        <Stack sx={{ pl: 2 }}>
          <Typography variant="h3">Private IP</Typography>
          <Typography>
            Use Private IP for a backend node to a NodeBalancer. Use VPC instead
            for private communication between your Linodes.
          </Typography>
        </Stack>
      }
      checked={field.value ?? false}
      control={<Checkbox />}
      disabled={isDistributedRegionSelected || isLinodeCreateRestricted}
      onChange={field.onChange}
    />
  );
};
