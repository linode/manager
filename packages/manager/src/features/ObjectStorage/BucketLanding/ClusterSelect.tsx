import { ObjectStorageCluster } from '@linode/api-v4/lib/object-storage';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import { compose } from 'recompose';
import { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import { ExtendedRegion } from 'src/components/EnhancedSelect/variants/RegionSelect/RegionSelect';
import { dcDisplayNames } from 'src/constants';
import clustersContainer, {
  StateProps
} from 'src/containers/clusters.container';
import useRegions from 'src/hooks/useRegions';
import { formatRegion } from 'src/utilities/formatRegion';

interface Props {
  selectedCluster: string;
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  error?: string;
  disabled?: boolean;
}

type CombinedProps = Props & StateProps;
export const ClusterSelect: React.FC<CombinedProps> = props => {
  const {
    selectedCluster,
    error,
    onChange,
    onBlur,
    clustersData,
    clustersError,
    disabled
  } = props;

  const options: Item<string>[] = clustersData.map(eachCluster => ({
    value: eachCluster.id,
    label: formatRegion(eachCluster.region) || eachCluster.region
  }));

  const { entities } = useRegions();

  const regions = React.useMemo(
    () => objectStorageClusterToExtendedRegion(clustersData, entities),
    [clustersData, entities]
  );

  // React.useEffect(() => {
  //   // If there's only one option, we want it to selected by default.
  //   // If it isn't already selected, call `onChange` with it so Formik knows about it.
  //   if (options.length === 1 && selectedCluster !== options[0].value) {
  //     onChange(options[0].value);
  //   }
  // }, []);

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
      handleSelection={(id: string) => onChange(id)}
      onBlur={onBlur}
      isSearchable={false}
      isClearable={false}
      errorText={errorText}
      defaultValue={options.length === 1 && options[0]}
      disabled={disabled}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(clustersContainer);

export default enhanced(ClusterSelect);

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
      thisRegion => thisRegion.id === thisCluster.region
    );
    if (region) {
      acc.push({
        ...region,
        id: thisCluster.id,
        display: dcDisplayNames[region.id]
      });
    }
    return acc;
  }, []);
};
