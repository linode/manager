import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  selectedCluster: string;
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  error?: string;
  disabled?: boolean;
}

export const ClusterSelect: React.FC<Props> = (props) => {
  const { selectedCluster, error, onChange, onBlur, disabled } = props;

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
      name="cluster"
      label="Region"
      regions={regionOptions ?? []}
      selectedID={selectedCluster}
      placeholder="Select a Region"
      handleSelection={(id) => onChange(id)}
      onBlur={onBlur}
      isSearchable={false}
      isClearable={false}
      errorText={errorText}
      disabled={disabled}
    />
  );
};

export default ClusterSelect;
