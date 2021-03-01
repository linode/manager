import { NodeBalancerConfig } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { connect, MapStateToProps } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface StateProps {
  configs: NodeBalancerConfig[];
  configsLoading: boolean;
  configsError?: Error | APIError[];
}

const container = (nodeBalancerId: number) => {
  const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (
    state
  ) => {
    const thisNBConfigState =
      state.__resources.nodeBalancerConfigs[nodeBalancerId];
    return {
      configs: Object.values(thisNBConfigState.itemsById ?? {}),
      configsLoading: thisNBConfigState.loading ?? false,
      configsError: thisNBConfigState.error?.read ?? [],
    };
  };
  return connect(mapStateToProps);
};

export default container;
