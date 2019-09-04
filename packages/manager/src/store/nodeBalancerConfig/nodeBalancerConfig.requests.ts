import {
  createNodeBalancerConfig as _createNodeBalancerConfig,
  deleteNodeBalancerConfig as _deleteNodeBalancerConfig,
  getNodeBalancerConfigs as _getNodeBalancerConfigs,
  NodeBalancerConfig,
  updateNodeBalancerConfig as _updateNodeBalancerConfig
} from 'linode-js-sdk/lib/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk, getAddRemoved } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  addNodeBalancerConfigs,
  createNodeBalancerConfigActions,
  deleteNodeBalancerConfigActions,
  getAllNodeBalancerConfigsActions,
  removeNodeBalancerConfigs,
  updateNodeBalancerConfigActions
} from './nodeBalancerConfig.actions';

const getNodeBalancerConfigs = (nodeBalancerId: number) =>
  getAll<NodeBalancerConfig>(() => _getNodeBalancerConfigs(nodeBalancerId));

export const getAllNodeBalancerConfigs = createRequestThunk(
  getAllNodeBalancerConfigsActions,
  ({ nodeBalancerId }) =>
    getNodeBalancerConfigs(nodeBalancerId)().then(({ data }) => data)
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
  Promise<{}>
> = (params: { nodeBalancerConfigId: number; nodeBalancerId: number }) => (
  dispatch,
  getStore
) => {
  const { nodeBalancerConfigId, nodeBalancerId } = params;
  const { started, done, failed } = deleteNodeBalancerConfigActions;

  dispatch(started(params));

  return _deleteNodeBalancerConfig(nodeBalancerId, nodeBalancerConfigId)
    .then(response => {
      dispatch(done({ params, result: response }));
      return response;
    })
    .catch(error => {
      dispatch(failed({ params, error }));
      return Promise.reject(error);
    });
};

/**
 * Get a fresh list of configs for the NodeBalancer from the API and remove orphaned configs and
 * add found configs.
 *
 * An orphaned config is one which exists in the STORE but not in the API.
 * A new config is one which exists in the API but not in the STORE.
 */
export const updateNodeBalancerConfigs: ThunkActionCreator<void> = (
  nodeBalancerId: number
) => (dispatch, getStore) => {
  const {
    nodeBalancerConfigs: { itemsById: nodeBalancerConfigs }
  } = getStore().__resources;

  const storedConfigs = Object.values(nodeBalancerConfigs).filter(
    ({ nodebalancer_id }) => nodebalancer_id === nodeBalancerId
  );

  return getAll<NodeBalancerConfig>(() =>
    _getNodeBalancerConfigs(nodeBalancerId)
  )().then(({ data }) => {
    const [added, removed] = getAddRemoved(storedConfigs, data);

    if (removed.length > 0) {
      dispatch(removeNodeBalancerConfigs(removed.map(({ id }) => id)));
    }

    if (added.length > 0) {
      dispatch(addNodeBalancerConfigs(added));
    }
  });
};
