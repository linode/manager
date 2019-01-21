import * as Bluebird from 'bluebird';
import { createNodeBalancerConfig as _createNodeBalancerConfig, deleteNodeBalancerConfig as _deleteNodeBalancerConfig, getNodeBalancerConfigNodes as _getNodeBalancerConfigNodes, getNodeBalancerConfigs as _getNodeBalancerConfigs, NodeBalancerConfig, NodeBalancerConfigNode, updateNodeBalancerConfig as _updateNodeBalancerConfig } from 'src/services/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { addNodeBalancerConfigNodes, deleteNodeBalancerConfigNodesActions, removeNodeBalancerConfigNodes } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.actions';
import { createRequestThunk, getAddRemoved } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import { addNodeBalancerConfigs, createNodeBalancerConfigActions, deleteNodeBalancerConfigActions, getAllNodeBalancerConfigsActions, removeNodeBalancerConfigs, updateNodeBalancerConfigActions } from './nodeBalancerConfig.actions';

const getNodeBalancerConfigs = (nodeBalancerId: number) =>
  getAll<Linode.NodeBalancerConfig>(() => _getNodeBalancerConfigs(nodeBalancerId));

export const getAllNodeBalancerConfigs = createRequestThunk(
  getAllNodeBalancerConfigsActions,
  ({ nodeBalancerId }) =>
    getNodeBalancerConfigs(nodeBalancerId)()
      .then(({ data }) => data)
);

export const createNodeBalancerConfig = createRequestThunk(
  createNodeBalancerConfigActions,
  ({ nodeBalancerId, ...data }) => _createNodeBalancerConfig(nodeBalancerId, data),

)

export const updateNodeBalancerConfig = createRequestThunk(
  updateNodeBalancerConfigActions,
  ({ nodeBalancerId, nodeBalancerConfigId, ...data }) => _updateNodeBalancerConfig(nodeBalancerId, nodeBalancerConfigId, data),

)

export const deleteNodeBalancerConfig: ThunkActionCreator<Promise<{}>> = (params: { nodeBalancerConfigId: number; nodeBalancerId: number }) => (dispatch, getStore) => {
  const { nodeBalancerConfigId, nodeBalancerId } = params;
  const { started, done, failed } = deleteNodeBalancerConfigActions;
  const {
    __resources: {
      nodeBalancerConfigNodes: { itemsById: nodeBalancerConfigNodes } },
  } = getStore();

  dispatch(started({ nodeBalancerId, nodeBalancerConfigId }));

  return _deleteNodeBalancerConfig(nodeBalancerId, nodeBalancerConfigId)
    .then((response) => {
      dispatch(done({ result: response, params }));

      /** Delete NodeBalancerConfigNodes belonging to this NodeBalancerConfig */
      Object
        .values(nodeBalancerConfigNodes)
        .filter(({ config_id, nodebalancer_id }) => config_id === nodeBalancerConfigId && nodebalancer_id === nodeBalancerId)
        .map((n) => n.id)
        .forEach((nodeBalancerConfigNodeId) => {
          dispatch(deleteNodeBalancerConfigNodesActions.done({ params: { ...params, nodeBalancerConfigNodeId }, result: {} }))
        });

      return response;
    })
    .catch((error) => {
      dispatch(failed({ error, params }))
      return Promise.reject(error);
    });
}


/**
 * Get a fresh list of configs for the NodeBalancer from the API and remove orphaned configs and
 * nodes, and add found configs and their nodes.
 *
 * An orphaned config is one which exists in the STORE but not in the API.
 * A new config is one which exists in the API but not in the STORE.
 */
export const updateNodeBalancerConfigsAndNodes: ThunkActionCreator<void> = (nodeBalancerId: number) => (dispatch, getStore) => {
  const { nodeBalancerConfigs: { itemsById: nodeBalancerConfigs } } = getStore().__resources;

  const storedConfigs = Object.values(nodeBalancerConfigs)
    .filter(({ nodebalancer_id }) => nodebalancer_id === nodeBalancerId);

  return getAll<NodeBalancerConfig>(() => _getNodeBalancerConfigs(nodeBalancerId))()
    .then(({ data }) => {
      const [added, removed] = getAddRemoved(storedConfigs, data);

      if (removed.length > 0) {
        dispatch(removeConfigs(nodeBalancerId, removed));
      }

      if(added.length > 0) {
        return dispatch(addConfigs(nodeBalancerId, added));
      }

      /** Noop return of a Promise for consumers to await. */
      return Promise.resolve();
    });
};

/** When removing a config we also have to remove all of it's nodes. */
const removeConfigs: ThunkActionCreator<void> = (nodeBalancerId: number, configs: NodeBalancerConfig[]) => (dispatch, getStore) => {
  const configIds = configs.map((config) => config.id);

  const { itemsById } = getStore().__resources.nodeBalancerConfigNodes;
  const nodeIds = Object.values(itemsById)
    .filter((node) => configIds.includes(node.config_id))
    .map((node) => node.id);

  dispatch(removeNodeBalancerConfigNodes(nodeIds));
  dispatch(removeNodeBalancerConfigs(configIds));
};

/** When adding a config we have to add all of it's nodes as well. */
const addConfigs: ThunkActionCreator<Bluebird<void>> = (nodeBalancerId: number, configs: NodeBalancerConfig[]) => (dispatch, getStore) => {
  return Bluebird.map(configs, (nodeBalancerConfig) => {
    return getAll<NodeBalancerConfigNode>(() => _getNodeBalancerConfigNodes(nodeBalancerId, nodeBalancerConfig.id))()
      .then(({ data }) => data);
  })
    .then((groupedNodes) => {
      const nodes = groupedNodes.reduce((result, groupNode) => [...result, ...groupNode], []);
      dispatch(addNodeBalancerConfigNodes(nodes));
      dispatch(addNodeBalancerConfigs(configs));
    })
};
