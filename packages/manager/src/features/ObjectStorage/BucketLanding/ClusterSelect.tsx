import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { Region } from '@linode/api-v4/lib/regions';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string) => void;
  required?: boolean;
  selectedCluster: string;
}

export const ClusterSelect: React.FC<Props> = (props) => {
  const {
    disabled,
    error,
    onBlur,
    onChange,
    required,
    selectedCluster,
  } = props;

  const { data: clusters, error: clustersError } = useObjectStorageClusters();
  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  const regionOptions = clusters?.reduce<Region[]>((acc, cluster) => {
    const region = regions?.find((r) => r.id === cluster.region);
    if (region) {
      acc.push({ ...region, id: cluster.id });
    }
    return acc;
  }, []);

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = clustersError
    ? 'Error loading regions'
    : error
    ? error
    : undefined;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      data-qa-select-cluster
      disableClearable
      disabled={disabled}
      errorText={errorText}
      label="Region"
      onBlur={onBlur}
      onChange={(e, region) => onChange(region.id)}
      placeholder="Select a Region"
      regions={regionOptions ?? []}
      required={required}
      value={selectedCluster}
    />
  );
};

export default ClusterSelect;
