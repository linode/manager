import { EventHandler } from 'src/store/middleware/combineEventsMiddleware';
import { ApplicationState } from '..';
import { removeNodeBalancerConfigs } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { removeNodeBalancerConfigNodes } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.actions';
import { ThunkDispatch } from '../types';
import { deleteNodeBalancerActions } from './nodeBalancer.actions';
import { getNodeBalancerWithConfigsAndNodes } from './nodeBalancer.requests';

const nodeBalancerEventHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;
  const { __resources } = getState();

  switch (action) {
    case 'nodebalancer_create':
      return handleNodeBalancerCreate(dispatch, id, action, status, __resources);

    case 'nodebalancer_delete':
      return handleNodeBalancerDelete(dispatch, id, action, status, __resources);
  }
};

export default nodeBalancerEventHandler;

type NodeBalancerActionHandler = (
  dispatch: ThunkDispatch,
  id: number,
  action: Linode.EventAction,
  status: Linode.EventStatus,
  resourceState: ApplicationState['__resources'],
) => void;

const handleNodeBalancerCreate: NodeBalancerActionHandler = (dispatch, id, action, status) => {
  switch (status) {
    case 'failed':
      return;

    case 'finished':
    case 'scheduled':
    case 'started':
    case 'notification':
    default:
      dispatch(getNodeBalancerWithConfigsAndNodes({ nodeBalancerId: id }));
      return;
  }
};

const handleNodeBalancerDelete: NodeBalancerActionHandler = (dispatch, nodeBalancerId, action, status, resourceState) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
    default:

      /** Delete NodeBalancer and all configs and nodes owned by the NodeBalancer. */
      const { itemsById: nodeBalancerConfigs } = resourceState.nodeBalancerConfigs;
      const { itemsById: nodeBalancerConfigNodes } = resourceState.nodeBalancerConfigNodes;

      const configsArray = Object.values(nodeBalancerConfigs) || [];
      const nodesArray = Object.values(nodeBalancerConfigNodes) || [];

      const configsToDelete = configsArray
        .reduce((result, { nodebalancer_id, id }) =>
          nodebalancer_id === nodeBalancerId
            ? [...result, id]
            : result,
          []);


      const nodesToDelete = configsToDelete
        .reduce((result, nodeBalancerConfigId) => {
          const nodes = nodesArray.filter(({ config_id }) => config_id === nodeBalancerConfigId);
          return nodes ? [...result, ...nodes.map(({ id }) => id)] : result;
        }, []);

      dispatch(removeNodeBalancerConfigNodes(nodesToDelete));
      dispatch(removeNodeBalancerConfigs(configsToDelete));
      dispatch(deleteNodeBalancerActions.done({ params: { nodeBalancerId }, result: {} }));
      return;
  }
};
