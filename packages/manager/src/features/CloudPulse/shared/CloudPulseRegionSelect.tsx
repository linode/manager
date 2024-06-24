import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';

export interface CloudPulseRegionSelectProps {
  handleRegionChange: (region: string | undefined) => void;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();
    const [selectedRegion, setRegion] = React.useState<string>();

    React.useEffect(() => {
      if (selectedRegion) {
        props.handleRegionChange(selectedRegion);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion]);

    return (
      <RegionSelect
        currentCapability={undefined}
        disableClearable
        fullWidth
        label=""
        noMarginTop
        onChange={(e, region) => setRegion(region.id)}
        regions={regions ? regions : []}
        value={undefined}
      />
    );
  }
);
