import React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';

import type { Region } from '@linode/api-v4';

export interface AlertsRegionProps {
  /**
   * Callback for publishing the ids of the selected regions
   */
  handleSelectionChange: (regions: string[]) => void;
  /**
   * The regions to be displayed according to the resources associated with alerts
   */
  regionOptions: Region[];
}

export const AlertsRegionFilter = React.memo((props: AlertsRegionProps) => {
  const { handleSelectionChange, regionOptions } = props;

  const [selectedRegion, setSelectedRegion] = React.useState<Region[]>([]);

  const handleRegionChange = React.useCallback(
    (regionIds: string[]) => {
      handleSelectionChange(
        regionIds.length ? regionIds : regionOptions.map(({ id }) => id) // if the selected regionIds are empty, means all regions are selected here
      );
      setSelectedRegion(
        regionOptions.filter((region) => regionIds.includes(region.id)) // Update selected regions based on current selections
      );
    },
    [handleSelectionChange, regionOptions]
  );
  return (
    <RegionMultiSelect
      slotProps={{
        popper: {
          placement: 'bottom',
        },
      }}
      textFieldProps={{
        hideLabel: true,
      }}
      currentCapability={undefined} // this is a required property
      disableSelectAll
      isClearable
      label="Select Regions"
      limitTags={1}
      onChange={handleRegionChange}
      placeholder={selectedRegion.length ? '' : 'Select Regions'}
      regions={regionOptions}
      selectedIds={selectedRegion.map((region) => region.id)}
    />
  );
});
