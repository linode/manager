import * as React from 'react';
import { compose } from 'recompose';
import FormControl from 'src/components/core/FormControl';
import InputLabel from 'src/components/core/InputLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import clustersContainer, {
  DefaultProps as WithClusters
} from 'src/containers/clusters.container';
import { formatRegion } from 'src/utilities';

export const regionSupportMessage =
  'This region does not currently support Block Storage.';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});
interface Props {
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  error?: string;
}

type CombinedProps = Props & WithClusters & WithStyles<ClassNames>;

export const ClusterSelect: React.StatelessComponent<CombinedProps> = props => {
  const { error, onChange, onBlur, clustersData } = props;

  const options: Item<string>[] = clustersData.map(eachCluster => ({
    value: eachCluster.id,
    label: formatRegion(eachCluster.region)
  }));

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="cluster" disableAnimation shrink={true}>
        Cluster
      </InputLabel>
      <Select
        data-qa-select-cluster
        name="cluster"
        options={options}
        placeholder="All Clusters"
        onChange={(item: Item<string>) => onChange(item.value)}
        onBlur={onBlur}
        isSearchable={false}
        isClearable={false}
        errorText={error}
      />
    </FormControl>
  );
};

const styled = withStyles(styles);

const withClusters = clustersContainer();

const enhanced = compose<CombinedProps, Props>(
  styled,
  withClusters
);

export default enhanced(ClusterSelect);
