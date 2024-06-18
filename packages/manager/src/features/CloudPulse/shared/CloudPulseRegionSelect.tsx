/* eslint-disable no-console */
import { Dashboard } from '@linode/api-v4';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';

export interface CloudPulseRegionSelectProps {
  handleRegionChange: (region: string | null) => void;
  selectedDashboard: Dashboard | undefined;
  selectedRegion: string | null;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();

    return (
      <RegionSelect
        currentCapability={undefined}
        disableClearable={false}
        fullWidth
        label=""
        noMarginTop
        onChange={(e, region) => props.handleRegionChange(region?.id ?? null)}
        regions={regions ? regions : []}
        disabled={!props.selectedDashboard}
        value={props.selectedRegion}
      />
    );
  }
);
