import React from 'react';

import { Flag } from 'src/components/Flag';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import type { Country } from '@linode/api-v4';

export const regions = [
  { country: 'us', id: 'us-iad', label: 'Washington, DC' },
  { country: 'us', id: 'us-lax', label: 'Los Angeles, CA' },
  { country: 'fr', id: 'fr-par', label: 'Paris, FR' },
  { country: 'jp', id: 'jp-osa', label: 'Osaka, JP' },
  { country: 'au', id: 'ap-southeast', label: 'Sydney, AU' },
];

export const LoadBalancerRegions = () => {
  return (
    <Stack spacing={1.25}>
      {regions.map((region) => (
        <Stack alignItems="center" direction="row" key={region.id} spacing={2}>
          <Flag country={region.country as Country} />
          <Typography>{`${region.label} (${region.id})`}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};
