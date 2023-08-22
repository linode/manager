import * as React from 'react';

import { useRegionsQuery } from 'src/queries/regions';
import { Typography } from 'src/components/Typography';

interface Props {
  region: string;
}

export const RegionsCell = (props: Props) => {
  const { region } = props;
  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Typography noWrap>
      {actualRegion?.label ? `${actualRegion.label} (${region})` : region}
    </Typography>
  );
};
