import { ObjectStorageCluster } from '@linode/api-v4/lib/object-storage';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import { ExtendedRegion } from 'src/components/EnhancedSelect/variants/RegionSelect/RegionSelect';
import { dcDisplayNames } from 'src/constants';
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

  const {
    data: clustersData,
    error: clustersError,
  } = useObjectStorageClusters();

  const _regions = useRegionsQuery().data ?? [];

  const regions = React.useMemo(
    () => objectStorageClusterToExtendedRegion(clustersData || [], _regions),
    [clustersData, _regions]
  );

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = clustersError
    ? 'Error loading Regions'
    : error
    ? error
    : undefined;

  return (
    <RegionSelect
      data-qa-select-cluster
      name="cluster"
      label="Region"
      regions={regions}
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

// This bit of hackery transforms a list of OBJ Clusters to Extended Region by
// matching up their IDs. We do this so RegionSelect understands the datatype we
// give it. The nested loop doesn't bother me since the inputs are small and the
// function is memoized using React.useMemo().
export const objectStorageClusterToExtendedRegion = (
  clusters: ObjectStorageCluster[],
  regions: Region[]
): ExtendedRegion[] => {
  return clusters.reduce<ExtendedRegion[]>((acc, thisCluster) => {
    const region = regions.find(
      (thisRegion) => thisRegion.id === thisCluster.region
    );
    if (region) {
      acc.push({
        ...region,
        id: thisCluster.id,
        display: dcDisplayNames[region.id],
      });
    }
    return acc;
  }, []);
};
