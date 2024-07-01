/* eslint-disable no-console */
import { Dashboard } from '@linode/api-v4';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { updateGlobalFilterPreference } from '../Utils/UserPreference';
import { REGION, RESOURCES } from '../Utils/CloudPulseConstants';
import Select from 'src/components/EnhancedSelect/Select';

export interface CloudPulseRegionSelectProps {
  handleRegionChange: (region: string | undefined) => void;
  selectedDashboard: Dashboard | undefined;
  selectedRegion: string | undefined;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();

    if(!regions){
      return (
        <Select
          disabled={true}
          isClearable={true}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => { }}
          placeholder="Select a Region"
        />
      )
    }
    return (
      <RegionSelect
        currentCapability={undefined}
        disableClearable={false}
        fullWidth
        label=""
        noMarginTop
        onChange={(e, region) => {
          updateGlobalFilterPreference({
            [REGION] : region?.id,
            [RESOURCES] : []
          });
          props.handleRegionChange(region?.id);
        }}
        regions={regions ? regions : []}
        disabled={!props.selectedDashboard}
        value={props.selectedRegion}
      />
    );
  }
);
