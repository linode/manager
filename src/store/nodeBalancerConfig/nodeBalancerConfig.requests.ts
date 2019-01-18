import { createNodeBalancerConfig as _createNodeBalancerConfig, deleteNodeBalancerConfig as _deleteNodeBalancerConfig, getNodeBalancerConfigs as _getNodeBalancerConfigs, updateNodeBalancerConfig as _updateNodeBalancerConfig } from 'src/services/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { deleteNodeBalancerConfigNodesActions } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.actions';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import { createNodeBalancerConfigActions, deleteNodeBalancerConfigActions, getAllNodeBalancerConfigsActions, updateNodeBalancerConfigActions } from './nodeBalancerConfig.actions';

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
