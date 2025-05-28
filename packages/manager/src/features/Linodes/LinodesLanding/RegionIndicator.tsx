import { useRegionsQuery } from '@linode/queries';
import * as React from 'react';

interface Props {
  region: string;
}

export const RegionIndicator = (props: Props) => {
  const { region } = props;
  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <div style={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
      {actualRegion?.label ?? region}
    </div>
  );
};
