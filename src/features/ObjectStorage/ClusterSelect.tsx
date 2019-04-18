import * as React from 'react';
import { compose } from 'recompose';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import clustersContainer, {
  StateProps
} from 'src/containers/clusters.container';
import { formatRegion } from 'src/utilities';

interface Props {
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  error?: string;
}

type CombinedProps = Props & StateProps;
export const ClusterSelect: React.StatelessComponent<CombinedProps> = props => {
  const { error, onChange, onBlur, clustersData, clustersError } = props;

  const options: Item<string>[] = clustersData.map(eachCluster => ({
    value: eachCluster.id,
    label: formatRegion(eachCluster.region)
  }));

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = clustersError
    ? 'Error loading Clusters'
    : error
    ? error
    : undefined;

  return (
    <Select
      data-qa-select-cluster
      name="cluster"
      label="Cluster"
      options={options}
      placeholder="All Clusters"
      onChange={(item: Item<string>) => onChange(item.value)}
      onBlur={onBlur}
      isSearchable={false}
      isClearable={false}
      errorText={errorText}
      defaultValue={options.length === 1 && options[0]}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(clustersContainer);

export default enhanced(ClusterSelect);
