import { NodeBalancerConfig } from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { connect, MapStateToProps } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface StateProps {
  configs: NodeBalancerConfig[];
  configsLoading: boolean;
  configsError?: Error | APIError[];
}

const mapStateToProps: MapStateToProps<
  StateProps,
  {},
  ApplicationState
> = state => ({
  configs: state.__resources.nodeBalancerConfigs.items.map(
    thisId => state.__resources.nodeBalancerConfigs.itemsById[thisId]
  ),
  configsLoading: state.__resources.nodeBalancerConfigs.loading,
  configsError: state.__resources.nodeBalancerConfigs.error
});

export default connect(mapStateToProps);
