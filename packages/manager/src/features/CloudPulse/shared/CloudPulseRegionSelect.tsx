import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { AclpConfig, Dashboard } from '@linode/api-v4';

export interface CloudPulseRegionSelectProps {
  handleRegionChange: (region: string | undefined, savePref?: boolean) => void;
  placeholder?: string;
  preferences?: AclpConfig;
  savePreferences?: boolean;
  selectedDashboard: Dashboard | undefined;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();

    const {
      handleRegionChange,
      placeholder,
      preferences,
      savePreferences,
      selectedDashboard,
    } = props;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      const defaultRegion = preferences?.region;

      if (regions && savePreferences) {
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
          setSelectedRegion(region?.id);
          handleRegionChange(region?.id, savePreferences);
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        currentCapability={undefined}
        data-testid="region-select"
        disableClearable={false}
        disabled={!selectedDashboard || !regions}
        fullWidth
        label="Select a Region"
        placeholder={placeholder ?? 'Select Region'}
        regions={regions ? regions : []}
        value={selectedRegion}
      />
    );
  },
  (
    oldProps: CloudPulseRegionSelectProps,
    newProps: CloudPulseRegionSelectProps
  ) => oldProps.selectedDashboard?.id === newProps.selectedDashboard?.id
);
