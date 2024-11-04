import { Notice, Paper } from '@linode/ui';
import React, { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { Divider } from 'src/components/Divider';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { Backups } from './Backups';
import { PrivateIP } from './PrivateIP';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Addons = () => {
  const regionId = useWatch<CreateLinodeRequest, 'region'>({ name: 'region' });

  const { data: regions } = useRegionsQuery();

  const selectedRegion = useMemo(
    () => regions?.find((r) => r.id === regionId),
    [regions, regionId]
  );

  const isDistributedRegionSelected =
    selectedRegion?.site_type === 'distributed';

  return (
    <Paper data-qa-add-ons>
      <Stack spacing={2}>
        <Typography variant="h2">Add-ons</Typography>
        {isDistributedRegionSelected && (
          <Notice
            text="Backups and Private IP are currently not available for distributed regions."
            variant="warning"
          />
        )}
        <Stack divider={<Divider />} spacing={2}>
          <Backups />
          <PrivateIP />
        </Stack>
      </Stack>
    </Paper>
  );
};
