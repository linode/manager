import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useFlags } from 'src/hooks/useFlags';

import type { Region } from '@linode/api-v4';

export interface AlertsRegionProps {
  /**
   * Callback for publishing the IDs of the selected regions.
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
  const flags = useFlags();
  const {
    data: accountAvailabilityData,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const handleRegionChange = React.useCallback(
    (regionIds: string[]) => {
      handleSelectionChange(
        regionIds.length ? regionIds : regionOptions.map(({ id }) => id) // If no regions are selected, include all region IDs
      );
      setSelectedRegion(
        regionOptions.filter((region) => regionIds.includes(region.id)) // Update the state with the regions matching the selected IDs
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
      sx={{
        width: '100%',
      }}
      textFieldProps={{
        hideLabel: true,
      }}
      accountAvailabilityData={accountAvailabilityData}
      accountAvailabilityLoading={accountAvailabilityLoading}
      currentCapability={undefined} // this is a required property, no specific capability required here
      disableSelectAll
      flags={flags}
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
