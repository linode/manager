import { EventAction, EventStatus } from 'linode-js-sdk/lib/account';
import { EventHandler } from 'src/store/types';
import { ApplicationState } from '..';
import { removeNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { ThunkDispatch } from '../types';
import { deleteNodeBalancerActions } from './nodeBalancer.actions';
import { getNodeBalancerWithConfigs } from './nodeBalancer.requests';

const nodeBalancerEventHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;
  const { __resources } = getState();

  switch (action) {
    case 'nodebalancer_create':
      return handleNodeBalancerCreate(
        dispatch,
        id,
        action,
        status,
        __resources
      );

    case 'nodebalancer_delete':
      return handleNodeBalancerDelete(
        dispatch,
        id,
        action,
        status,
        __resources
      );
  }
};

export default nodeBalancerEventHandler;

type NodeBalancerActionHandler = (
  dispatch: ThunkDispatch,
  id: number,
  action: EventAction,
  status: EventStatus,
  resourceState: ApplicationState['__resources']
) => void;

const handleNodeBalancerCreate: NodeBalancerActionHandler = (
  dispatch,
  nodeBalancerId,
  action,
  status,
  resourceState
) => {
  switch (status) {
    case 'failed':
      return;

    case 'finished':
    case 'scheduled':
    case 'started':
    case 'notification':
    default:
      const {
        nodeBalancers: { itemsById: nodeBalancers }
      } = resourceState;

      /** If we already have it, don't request it. */
      if (nodeBalancers[nodeBalancerId]) {
        return;
      }

      dispatch(getNodeBalancerWithConfigs({ nodeBalancerId }));
      return;
  }
};

const handleNodeBalancerDelete: NodeBalancerActionHandler = (
  dispatch,
  nodeBalancerId,
  action,
  status,
  resourceState
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
    default:
      /** Delete NodeBalancer and all configs owned by the NodeBalancer. */
      const {
        nodeBalancers: { itemsById: nodeBalancers },
        nodeBalancerConfigs: { itemsById: nodeBalancerConfigs }
      } = resourceState;

      /** If it's already out of state, don't bother trying to delete. */
      if (!nodeBalancers[nodeBalancerId]) {
        return;
      }

      const configsArray = Object.values(nodeBalancerConfigs) || [];

      const configsToDelete = configsArray.reduce(
        (result, { nodebalancer_id, id }) =>
          nodebalancer_id === nodeBalancerId ? [...result, id] : result,
        []
      );

      dispatch(removeNodeBalancerConfigs(configsToDelete));
      dispatch(
        deleteNodeBalancerActions.done({
          params: { nodeBalancerId },
          result: {}
        })
      );
      return;
  }
};
