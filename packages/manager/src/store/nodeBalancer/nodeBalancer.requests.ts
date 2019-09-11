import * as Bluebird from 'bluebird';
import {
  createNodeBalancer as _createNodeBalancer,
  deleteNodeBalancer as _deleteNodeBalancer,
  getNodeBalancer as _getNodeBalancer,
  getNodeBalancerConfigs,
  getNodeBalancerConfigs as _getNodeBalancerConfigs,
  getNodeBalancers,
  NodeBalancer,
  NodeBalancerConfig,
  updateNodeBalancer as _updateNodeBalancer
} from 'linode-js-sdk/lib/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { addNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { getAllNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.requests';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  CreateNodeBalancerParams,
  createNodeBalancersActions,
  deleteNodeBalancerActions,
  getAllNodeBalancersActions,
  getNodeBalancerWithConfigsActions,
  GetNodeBalancerWithConfigsParams,
  updateNodeBalancersActions
} from './nodeBalancer.actions';

const getAllNodeBalancersRequest = getAll<NodeBalancer>(getNodeBalancers);

export const getAllNodeBalancers = createRequestThunk(
  getAllNodeBalancersActions,
  () => getAllNodeBalancersRequest().then(({ data }) => data)
);

/**
 * API allows for creating of NodeBalancer with configs and nodes, however the response does not
 * include the newly created configs or nodes. In order to keep the state updated, we manually
 * request the configs after successful creation.
 */
export const createNodeBalancer: ThunkActionCreator<Promise<NodeBalancer>> = (
  params: CreateNodeBalancerParams
) => dispatch => {
  const { started, done, failed } = createNodeBalancersActions;

  dispatch(started(params));

  return _createNodeBalancer(params)
    .then(response => {
      const { id: nodeBalancerId } = response;

      dispatch(getAllNodeBalancerConfigs({ nodeBalancerId }));

      dispatch(done({ result: response, params }));
      return response;
    })
    .catch(error => {
      dispatch(failed({ error, params }));
      return Promise.reject(error);
    });
};

export const deleteNodeBalancer: ThunkActionCreator<Promise<{}>> = (params: {
  nodeBalancerId: number;
}) => dispatch => {
  const { nodeBalancerId } = params;
  const { started, done, failed } = deleteNodeBalancerActions;

  dispatch(started({ nodeBalancerId }));

  return _deleteNodeBalancer(nodeBalancerId)
    .then(response => {
      dispatch(done({ params, result: {} }));
      return response;
    })
    .catch(error => {
      dispatch(failed({ params, error }));
      return Promise.reject(error);
    });
};

export const updateNodeBalancer = createRequestThunk(
  updateNodeBalancersActions,
  ({ nodeBalancerId, ...data }) => _updateNodeBalancer(nodeBalancerId, data)
);

export const getAllNodeBalancersWithConfigs: ThunkActionCreator<
  Promise<void>
> = () => async dispatch => {
  const { started, done, failed } = getAllNodeBalancersActions;
  dispatch(started());

  try {
    const { data: nodeBalancers } = await getAllNodeBalancersRequest();

    const nodeBalancerConfigs = await Bluebird.reduce(
      nodeBalancers,
      async (result: NodeBalancerConfig[], nodeBalancer) => {
        const { data: configs } = await getAll<NodeBalancerConfig>(() =>
          _getNodeBalancerConfigs(nodeBalancer.id)
        )();
        return [...result, ...configs];
      },
      []
    );

    dispatch(addNodeBalancerConfigs(nodeBalancerConfigs));
    dispatch(done({ result: nodeBalancers }));
  } catch (error) {
    dispatch(failed({ error }));
  }
};

export const getNodeBalancerWithConfigs: ThunkActionCreator<
  Promise<NodeBalancer>
> = (params: GetNodeBalancerWithConfigsParams) => async dispatch => {
  const { nodeBalancerId } = params;
  const { started, done, failed } = getNodeBalancerWithConfigsActions;

  dispatch(started(params));

  try {
    const nodeBalancer = await _getNodeBalancer(nodeBalancerId);
    const { data: nodeBalancerConfigs } = await getAll<NodeBalancerConfig>(
      getNodeBalancerConfigs
    )();
    dispatch(addNodeBalancerConfigs(nodeBalancerConfigs));
    dispatch(done({ params, result: nodeBalancer }));

    return nodeBalancer;
  } catch (error) {
    dispatch(failed({ params, error }));
    return error;
  }
};
