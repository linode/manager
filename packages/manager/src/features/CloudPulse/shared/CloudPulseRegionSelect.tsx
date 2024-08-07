import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { REGION, RESOURCES } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { Dashboard } from '@linode/api-v4';

export interface CloudPulseRegionSelectProps {
  handleRegionChange: (region: string | undefined) => void;
  placeholder?: string;
  savePreferences?: boolean;
  selectedDashboard: Dashboard | undefined;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { isGeckoGAEnabled } = useIsGeckoEnabled();
    const { data: regions } = useRegionsQuery({
      transformRegionLabel: isGeckoGAEnabled,
    });

    const { handleRegionChange, placeholder, selectedDashboard } = props;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      const defaultRegion = getUserPreferenceObject()?.region;

      if (regions) {
        if (defaultRegion) {
          const region = regions.find((obj) => obj.id === defaultRegion)?.id;
          handleRegionChange(region);
          setSelectedRegion(region);
        } else {
          setSelectedRegion(undefined);
          handleRegionChange(undefined);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regions, selectedDashboard]);

    return (
      <RegionSelect
        onChange={(_, region) => {
          updateGlobalFilterPreference({
            [REGION]: region?.id,
            [RESOURCES]: undefined,
          });
          setSelectedRegion(region?.id);
          handleRegionChange(region?.id);
        }}
        currentCapability={undefined}
        data-testid="region-select"
        disableClearable={false}
        disabled={!selectedDashboard || !regions}
        fullWidth
        label=""
        noMarginTop
        placeholder={placeholder ?? 'Select Region'}
        regions={regions ? regions : []}
        value={selectedRegion}
      />
    );
  }
);
