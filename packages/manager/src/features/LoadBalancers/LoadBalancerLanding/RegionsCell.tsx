import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  regionId: string;
}

export const RegionsCell = ({ regionId }: Props) => {
  const { data: allRegions } = useRegionsQuery();

  const region = allRegions?.find((r) => r.id === regionId);

  if (!region) {
    return <Typography noWrap>{regionId}</Typography>;
  }

  return (
    <Typography noWrap>
      {region.label} ({region.id})
    </Typography>
  );
};
