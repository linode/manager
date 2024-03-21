import * as React from 'react';

import { Flag } from 'src/components/Flag';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { Country } from '@linode/api-v4';

interface Props {
  /**
   * Shows a country flag for the region
   * @default false
   */
  hideFlag?: boolean;
  /**
   * The region id
   */
  regionId: string;
}

export const RegionItem = ({ hideFlag, regionId }: Props) => {
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === regionId);

  if (!region) {
    return (
      <Stack alignItems="center" direction="row" spacing={2}>
        {!hideFlag && <Flag country={'' as Country} />}
        <Typography>{regionId}</Typography>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" direction="row" spacing={2}>
      {!hideFlag && <Flag country={region.country as Country} />}
      <Typography>
        {region.label} ({region.id})
      </Typography>
    </Stack>
  );
};
