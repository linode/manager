import { sortByString } from '@akamai/compute-ui-core/formatting';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { RegionMultiSelect } from 'src/features/ObjectStorage/Partials/RegionMultiSelect';
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
  const { errors: regionListFetchErrors, objectStorageRegions } =
    useObjectStorageRegions();

  // Error could be: 1. General Regions error, 2. Field error, 3. Nothing
  const errorText = error || regionListFetchErrors?.[0]?.reason;

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
      regions={objectStorageRegions ?? []}
      required={required}
      selectedIds={selectedRegion}
      sortRegionOptions={sortRegionOptions}
    />
  );
};
