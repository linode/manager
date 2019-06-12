import * as React from 'react';
import { compose } from 'recompose';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { Props as TextFieldProps } from 'src/components/TextField';
import withNodeBalancers from 'src/containers/withNodeBalancers.container';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface WithNodeBalancersProps {
  nodeBalancersData: Linode.NodeBalancer[];
  nodeBalancersLoading: boolean;
  nodeBalancersError?: Linode.ApiFieldError[];
}

interface Props {
  generalError?: string;
  nodeBalancerError?: string;
  selectedNodeBalancer: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (nodeBalancer: Linode.NodeBalancer) => void;
  textFieldProps?: TextFieldProps;
}

type CombinedProps = Props & WithNodeBalancersProps;

const nodeBalancersToItems = (
  nodeBalancers: Linode.NodeBalancer[]
): Item<number>[] =>
  nodeBalancers.map(thisNodeBalancer => ({
    value: thisNodeBalancer.id,
    label: thisNodeBalancer.label,
    data: thisNodeBalancer
  }));

const nodeBalancerFromItems = (
  nodeBalancers: Item<number>[],
  nodeBalancerId: number | null
) => {
  if (!nodeBalancerId) {
    return;
  }
  return nodeBalancers.find(
    thisNodeBalancer => thisNodeBalancer.value === nodeBalancerId
  );
};

const NodeBalancerSelect: React.StatelessComponent<CombinedProps> = props => {
  const {
    disabled,
    generalError,
    handleChange,
    nodeBalancerError,
    nodeBalancersError,
    nodeBalancersLoading,
    nodeBalancersData,
    region,
    selectedNodeBalancer
  } = props;

  const nodeBalancer = region
    ? nodeBalancersData.filter(
        thisNodeBalancer => thisNodeBalancer.region === region
      )
    : nodeBalancersData;
  const options = nodeBalancersToItems(nodeBalancer);

  const noOptionsMessage =
    !nodeBalancerError && !nodeBalancersLoading && options.length === 0
      ? 'You have no NodeBalancers to choose from'
      : 'No Options';

  return (
    <EnhancedSelect
      label="NodeBalancer"
      placeholder="Select a NodeBalancer"
      value={nodeBalancerFromItems(options, selectedNodeBalancer)}
      options={options}
      disabled={disabled}
      isLoading={nodeBalancersLoading}
      onChange={(selected: Item<number>) => {
        return handleChange(selected.data);
      }}
      errorText={getErrorStringOrDefault(
        generalError || nodeBalancerError || nodeBalancersError || ''
      )}
      isClearable={false}
      textFieldProps={props.textFieldProps}
      noOptionsMessage={() => noOptionsMessage}
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withNodeBalancers(
    (
      ownProps,
      nodeBalancersData,
      nodeBalancersLoading,
      nodeBalancersError
    ) => ({
      ...ownProps,
      nodeBalancersData,
      nodeBalancersLoading,
      nodeBalancersError
    })
  )
)(NodeBalancerSelect);
