import {
  createNodeBalancer as _createNodeBalancer,
  deleteNodeBalancer as _deleteNodeBalancer,
  getNodeBalancer as _getNodeBalancer,
  getNodeBalancers,
  NodeBalancer,
  updateNodeBalancer as _updateNodeBalancer,
} from '@linode/api-v4/lib/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { getAllNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.requests';
import { createRequestThunk } from '../store.helpers.tmp';
import { ThunkActionCreator } from '../types';
import {
  CreateNodeBalancerParams,
  createNodeBalancersActions,
  deleteNodeBalancerActions,
  getAllNodeBalancersActions,
  getNodeBalancersPageActions,
  getNodeBalancerWithConfigsActions,
  GetNodeBalancerWithConfigsParams,
  updateNodeBalancersActions,
} from './nodeBalancer.actions';

const getAllNodeBalancersRequest = getAll<NodeBalancer>(getNodeBalancers);

export const getAllNodeBalancers = createRequestThunk(
  getAllNodeBalancersActions,
  () => getAllNodeBalancersRequest()
);

export const getNodeBalancersPage = createRequestThunk(
  getNodeBalancersPageActions,
  ({ params, filters }) => getNodeBalancers(params, filters)
);

/**
 * API allows for creating of NodeBalancer with configs and nodes, however the response does not
 * include the newly created configs or nodes. In order to keep the state updated, we manually
 * request the configs after successful creation.
 */
export const createNodeBalancer: ThunkActionCreator<
  Promise<NodeBalancer>,
  CreateNodeBalancerParams
> = (params) => (dispatch) => {
  const { started, done, failed } = createNodeBalancersActions;

  dispatch(started(params));

  return _createNodeBalancer(params)
    .then((response) => {
      const { id: nodeBalancerId } = response;

      dispatch(getAllNodeBalancerConfigs({ nodeBalancerId }));

      dispatch(done({ result: response, params }));
      return response;
    })
    .catch((error) => {
      dispatch(failed({ error, params }));
      return Promise.reject(error);
    });
};

export const deleteNodeBalancer: ThunkActionCreator<
  Promise<{}>,
  { nodeBalancerId: number }
> = (params) => (dispatch) => {
  const { nodeBalancerId } = params;
  const { started, done, failed } = deleteNodeBalancerActions;

  dispatch(started({ nodeBalancerId }));

  return _deleteNodeBalancer(nodeBalancerId)
    .then((response) => {
      dispatch(done({ params, result: {} }));
      return response;
    })
    .catch((error) => {
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
> = () => async (dispatch) => {
  const { started, done, failed } = getAllNodeBalancersActions;
  dispatch(started());

  try {
    const result = await getAllNodeBalancersRequest();
    result.data.forEach((thisBalancer) => {
      dispatch(getAllNodeBalancerConfigs({ nodeBalancerId: thisBalancer.id }))
        // Errors will be added to the Redux state for each individual set of configs
        .catch((_) => null);
    });

    dispatch(done({ result }));
  } catch (error) {
    dispatch(failed({ error }));
  }
};

export const getNodeBalancerWithConfigs: ThunkActionCreator<
  Promise<NodeBalancer>,
  GetNodeBalancerWithConfigsParams
> = (params) => (dispatch) => {
  const { nodeBalancerId } = params;
  const { started, done, failed } = getNodeBalancerWithConfigsActions;

  dispatch(started(params));
  // This can be done in parallel.
  dispatch(getAllNodeBalancerConfigs({ nodeBalancerId })).catch((_) => null);
  return _getNodeBalancer(nodeBalancerId)
    .then((nodeBalancer) => {
      dispatch(done({ params, result: nodeBalancer }));
      return nodeBalancer;
    })
    .catch((error) => {
      dispatch(failed({ params, error }));
      return error;
    });
};
