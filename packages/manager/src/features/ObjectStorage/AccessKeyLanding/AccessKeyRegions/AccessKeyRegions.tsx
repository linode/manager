import { useIsGeckoEnabled } from '@linode/shared';
import { sortByString } from '@linode/utilities';
import * as React from 'react';

import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useFlags } from 'src/hooks/useFlags';

import type { Region } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onChange: (value: string[]) => void;
  required?: boolean;
  selectedRegion: string[];
}

const sortRegionOptions = (a: Region, b: Region) => {
  return sortByString(a.label, b.label, 'asc');
};

export const AccessKeyRegions = (props: Props) => {
  const { disabled, error, onChange, required, selectedRegion } = props;

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const { allRegionsError, availableStorageRegions } =
    useObjectStorageRegions();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || allRegionsError?.[0]?.reason;

  return (
    <RegionMultiSelect
      currentCapability="Object Storage"
      disabled={disabled}
      errorText={errorText}
      isClearable={false}
      isGeckoLAEnabled={isGeckoLAEnabled}
      label="Regions"
      onChange={onChange}
      placeholder={
        selectedRegion.length > 0 ? '' : 'Select regions or type to search'
      }
      regions={availableStorageRegions ?? []}
      required={required}
      selectedIds={selectedRegion}
      sortRegionOptions={sortRegionOptions}
    />
  );
};
