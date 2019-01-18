import { createNodeBalancer as _createNodeBalancer, deleteNodeBalancer as _deleteNodeBalancer, getNodeBalancers, updateNodeBalancer as _updateNodeBalancer } from 'src/services/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { deleteNodeBalancerConfigActions } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { getAllNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.requests';
import { deleteNodeBalancerConfigNodesActions } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.actions';
import { getAllNodeBalancerConfigNodes } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.requests';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import { CreateNodeBalancerParams, createNodeBalancersActions, deleteNodeBalancerActions, getAllNodeBalancersActions, updateNodeBalancersActions } from './nodeBalancer.actions';

const getAllNodeBalancersRequest = getAll<Linode.NodeBalancer>(getNodeBalancers);

export const getAllNodeBalancers = createRequestThunk(
  getAllNodeBalancersActions,
  () => getAllNodeBalancersRequest().then(({ data }) => data),
);

/**
 * API allows for creationg of NodeBalancer with configs and nodes, however the response does not
 * include the configs or nodes. In order to keep the state updated, we manually request the
 * configs and subsequent nodes after successful creation.
 */
export const createNodeBalancer: ThunkActionCreator<Promise<Linode.NodeBalancer>> = (params: CreateNodeBalancerParams) => (dispatch) => {

  const { started, done, failed } = createNodeBalancersActions;

  dispatch(started(params));

  return _createNodeBalancer(params)
    .then((response) => {
      const { id: nodeBalancerId } = response;

      dispatch(getAllNodeBalancerConfigs({ nodeBalancerId }))
        .then((configs) => {
          configs.forEach(({ id: nodeBalancerConfigId }) => {
            dispatch(getAllNodeBalancerConfigNodes({ nodeBalancerId, nodeBalancerConfigId }));
          });
        });

      dispatch(done({ result: response, params }));
      return response;
    })
    .catch((error) => {
      dispatch(failed({ error, params }));
      return Promise.reject(error);
    });
};

export const deleteNodeBalancer: ThunkActionCreator<Promise<{}>> = ({ nodeBalancerId }: { nodeBalancerId: number }) => (dispatch, getStore) => {
  const { started, done, failed } = deleteNodeBalancerActions;

  dispatch(started({ nodeBalancerId }));

  const {
    __resources: {
      nodeBalancerConfigs: { itemsById: nodeBalancerConfigs },
      nodeBalancerConfigNodes: { itemsById: nodeBalancerConfigNodes },
    },
  } = getStore();

  return _deleteNodeBalancer(nodeBalancerId)
    .then((response) => {

      /** Delete nodeBalancerConfigs belonging to this nodeBalancer */
      Object
        .values(nodeBalancerConfigs)
        .filter(({ nodebalancer_id }) => nodebalancer_id === nodeBalancerId)
        .map(({ id }) => id)
        .forEach((nodeBalancerConfigId) => {
          dispatch(deleteNodeBalancerConfigActions.done({ params: { nodeBalancerId, nodeBalancerConfigId }, result: {} }))

          /** Delete nodeBalancerConfigNodes belonging to this nodeBalancerConfig. */
          Object
            .values(nodeBalancerConfigNodes)
            .filter(({ config_id, nodebalancer_id }) => config_id === nodeBalancerConfigId && nodebalancer_id === nodeBalancerId)
            .map(({ id }) => id)
            .forEach((nodeBalancerConfigNodeId) => {
              dispatch(deleteNodeBalancerConfigNodesActions.done({ result: {}, params: { nodeBalancerConfigId, nodeBalancerConfigNodeId, nodeBalancerId } }))
            });

        });

      dispatch(done({ result: response, params: { nodeBalancerId } }));

      return response;
    })
    .catch((error) => {
      dispatch(failed({ error, params: { nodeBalancerId } }));
      return Promise.reject(error);
    })
}

export const updateNodeBalancer = createRequestThunk(
  updateNodeBalancersActions,
  ({ nodeBalancerId, ...data }) => _updateNodeBalancer(nodeBalancerId, data),
)

