import { EventHandler } from 'src/store/types';
import { getAllNodeBalancerConfigs } from './nodeBalancerConfig.requests';

/**
 * The entity for these events is the NB the config belongs to.
 * When a create/delete config event comes in, request the updated
 * configs for that NB to update our store.
 */
const nodeBalancerConfigEventHandler: EventHandler = (event, dispatch) => {
  const { action, entity } = event;
  const { id } = entity;

  switch (action) {
    case 'nodebalancer_config_delete':
    case 'nodebalancer_config_create':
      return dispatch(getAllNodeBalancerConfigs({ nodeBalancerId: id }));
    default:
      return;
  }
};

export default nodeBalancerConfigEventHandler;
