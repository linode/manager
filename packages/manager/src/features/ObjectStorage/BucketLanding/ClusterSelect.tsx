import * as React from 'react';
import { compose } from 'recompose';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import clustersContainer, {
  StateProps
} from 'src/containers/clusters.container';
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

  React.useEffect(() => {
    // If there's only one option, we want it to selected by default.
    // If it isn't already selected, call `onChange` with it so Formik knows about it.
    if (options.length === 1 && selectedCluster !== options[0].value) {
      onChange(options[0].value);
    }
  }, []);

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = clustersError
    ? 'Error loading Regions'
    : error
    ? error
    : undefined;

  return (
    <Select
      data-qa-select-cluster
      name="cluster"
      label="Region"
      options={options}
      placeholder="All Regions"
      onChange={(item: Item<string>) => onChange(item.value)}
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
