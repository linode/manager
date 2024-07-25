import * as React from 'react';

import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useRegionsQuery } from 'src/queries/regions/regions';

interface Props {
  region: string;
}

export const RegionIndicator = (props: Props) => {
  const { region } = props;
  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <div style={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
      {actualRegion?.label ?? region}
    </div>
  );
};
