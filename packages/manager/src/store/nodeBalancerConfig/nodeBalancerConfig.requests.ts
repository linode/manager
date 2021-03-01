import {
  createNodeBalancerConfig as _createNodeBalancerConfig,
  deleteNodeBalancerConfig as _deleteNodeBalancerConfig,
  getNodeBalancerConfigs as _getNodeBalancerConfigs,
  NodeBalancerConfig,
  updateNodeBalancerConfig as _updateNodeBalancerConfig,
} from '@linode/api-v4/lib/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createNodeBalancerConfigActions,
  deleteNodeBalancerConfigActions,
  getAllNodeBalancerConfigsActions,
  updateNodeBalancerConfigActions,
} from './nodeBalancerConfig.actions';

const getNodeBalancerConfigs = (nodeBalancerId: number) =>
  getAll<NodeBalancerConfig>(() => _getNodeBalancerConfigs(nodeBalancerId));

export const getAllNodeBalancerConfigs = createRequestThunk(
  getAllNodeBalancerConfigsActions,
  ({ nodeBalancerId }) => getNodeBalancerConfigs(nodeBalancerId)()
);

export const createNodeBalancerConfig = createRequestThunk(
  createNodeBalancerConfigActions,
  ({ nodeBalancerId, ...data }) =>
    _createNodeBalancerConfig(nodeBalancerId, data)
);

export const updateNodeBalancerConfig = createRequestThunk(
  updateNodeBalancerConfigActions,
  ({ nodeBalancerId, nodeBalancerConfigId, ...data }) =>
    _updateNodeBalancerConfig(nodeBalancerId, nodeBalancerConfigId, data)
);

export const deleteNodeBalancerConfig: ThunkActionCreator<
  Promise<{}>,
  { nodeBalancerConfigId: number; nodeBalancerId: number }
> = (params) => (dispatch) => {
  const { nodeBalancerConfigId, nodeBalancerId } = params;
  const { started, done, failed } = deleteNodeBalancerConfigActions;

  dispatch(started(params));

  return _deleteNodeBalancerConfig(nodeBalancerId, nodeBalancerConfigId)
    .then((response) => {
      dispatch(done({ params, result: response }));
      return response;
    })
    .catch((error) => {
      dispatch(failed({ params, error }));
      return Promise.reject(error);
    });
};
