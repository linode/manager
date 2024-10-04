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
    <Stack>
      <FormControlLabel
        control={
          <Checkbox
            inputProps={{
              'aria-labelledby': 'privateIPDesc',
            }}
            checked={field.value ?? false}
            disabled={isDistributedRegionSelected || isLinodeCreateRestricted}
            onChange={field.onChange}
            sx={{ pr: 3 }}
          />
        }
        slotProps={{
          typography: {
            sx: (theme) => ({
              fontFamily: theme.font.bold,
              fontSize: '1rem',
              pl: 0,
            }),
          },
        }}
        sx={(theme) => ({
          fontFamily: `${theme.font.bold} !important`,
          fontSize: '1rem',
          pl: 1,
        })}
        label="Private IP"
      />
      <Stack sx={{ pl: 7 }}>
        <Typography
          component="span"
          display="block"
          id="privateIPDesc"
          variant="body1"
        >
          Use Private IP for a backend node to a NodeBalancer. Use VPC instead
          for private communication between your Linodes.
        </Typography>
      </Stack>
    </Stack>
  );
};
