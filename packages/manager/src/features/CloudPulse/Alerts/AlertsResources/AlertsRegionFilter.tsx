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
  return (
    <RegionMultiSelect
      onChange={(ids: string[]) => {
        if (!Boolean(ids?.length)) {
          handleSelectionChange(regionOptions.map(({ id }) => id)); // publish all ids, no selection here is all selection
        } else {
          handleSelectionChange(ids); // publish only selected ids
        }

        setSelectedRegion(
          regionOptions.filter((region) => ids.includes(region.id))
        );
      }}
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
      placeholder={Boolean(selectedRegion?.length) ? '' : 'Select Regions'}
      regions={regionOptions}
      selectedIds={selectedRegion.map((region) => region.id)}
      value={selectedRegion}
    />
  );
});
