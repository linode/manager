import React from 'react';

import { Flag } from 'src/components/Flag';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

import type { Country } from '@linode/api-v4';

export const betaRegions = ['us-mia', 'us-lax', 'fr-par', 'jp-osa', 'id-cgk'];

interface Props {
  regionIds: string[];
}

export const LoadBalancerRegions = ({ regionIds }: Props) => {
  return (
    <Stack spacing={1.25}>
      {regionIds?.map((regionId) => (
        <RegionItem key={regionId} regionId={regionId} />
      ))}
    </Stack>
  );
};

interface RegionItemProps {
  regionId: string;
}

const RegionItem = ({ regionId }: RegionItemProps) => {
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === regionId);

  if (!region) {
    return (
      <Stack alignItems="center" direction="row" spacing={2}>
        <Flag country={'' as Country} />
        <Typography>{regionId}</Typography>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" direction="row" spacing={2}>
      <Flag country={region.country as Country} />
      <Typography>{`${region.label} (${region.id})`}</Typography>
    </Stack>
  );
};
