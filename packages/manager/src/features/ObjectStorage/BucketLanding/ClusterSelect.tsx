import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';

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
  const { data: regions } = useRegionsQuery();

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
      data-qa-select-cluster
      disabled={disabled}
      errorText={errorText}
      handleSelection={(id) => onChange(id)}
      isClearable={false}
      label="Region"
      onBlur={onBlur}
      placeholder="Select a Region"
      regions={regionOptions ?? []}
      required={required}
      selectedId={selectedCluster}
    />
  );
};

export default ClusterSelect;
