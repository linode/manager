import { EventHandler } from 'src/store/types';
import { updateNodeBalancerConfigs } from './nodeBalancerConfig.requests';

/**
 * Since the API provided event only returns the ID of the affected NodeBalancer, we have diff
 * the STORE and the API for the added/removed config and take action based on it's response.
 */
const nodeBalancerConfigEventHandler: EventHandler = (
  event,
  dispatch,
  getState
) => {
  const { action, entity } = event;
  const { id } = entity;

  switch (action) {
    case 'nodebalancer_config_delete':
    case 'nodebalancer_config_create':
      return dispatch(updateNodeBalancerConfigs(id));
    default:
      return;
  }
};

export default nodeBalancerConfigEventHandler;
