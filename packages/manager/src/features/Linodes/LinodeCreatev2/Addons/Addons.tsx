import React, { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
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

  const isEdgeRegionSelected = selectedRegion?.site_type === 'edge';

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Add-ons</Typography>
        {isEdgeRegionSelected && (
          <Notice
            text="Backups and Private IP are currently not available for Edge regions."
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
