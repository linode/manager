/* eslint-disable no-console */
import { Dashboard } from '@linode/api-v4';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions';
import { fetchUserPrefObject, updateGlobalFilterPreference } from '../Utils/UserPreference'
import { REGION, RESOURCES } from '../Utils/CloudPulseConstants';

export interface CloudViewRegionSelectProps {
  handleRegionChange: (region: string | undefined) => void;
  selectedDashboard?: Dashboard;
}

export const CloudViewRegionSelect = React.memo(
  (props: CloudViewRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();

    const getPrefferedRegion = () => {
      const defaultValue = fetchUserPrefObject()?.region;
      props.handleRegionChange(defaultValue);

      return defaultValue;
    };

    if (!props.selectedDashboard || !regions) {
      return <RegionSelect
        handleSelection={(value) => { }}
        currentCapability={undefined}
        noMarginTop
        fullWidth
        label=""
        regions={[]}
        selectedId={""}
      />
    }

    return (
      <RegionSelect
        handleSelection={(value) => {
          updateGlobalFilterPreference({ [REGION]: value, [RESOURCES]: [] });
          props.handleRegionChange(value);
        }}
        currentCapability={undefined}
        fullWidth
        isClearable={false}
        label=""
        noMarginTop
        regions={regions ? regions : []}
        selectedId={getPrefferedRegion()!}
      />
    );
  }
);
