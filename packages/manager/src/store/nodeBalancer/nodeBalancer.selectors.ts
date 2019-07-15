import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

export const nodeBalancersWithConfigs = createSelector(
  [
    (resources: ApplicationState['__resources']) =>
      resources.nodeBalancers.itemsById,
    (resources: ApplicationState['__resources']) =>
      resources.nodeBalancerConfigs.itemsById
  ],
  (nodeBalancers, nodeBalancerConfigs) => {
    return Object.values(nodeBalancers).map(nodeBalancer => ({
      ...nodeBalancer,
      configs: Object.values(nodeBalancerConfigs).filter(
        config => config.nodebalancer_id === nodeBalancer.id
      )
    }));
  }
);
