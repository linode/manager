import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

export const nodeBalancersWithConfigs = createSelector(
  [
    (resources: ApplicationState['__resources']) =>
      resources.nodeBalancers.itemsById,
    (resources: ApplicationState['__resources']) =>
      resources.nodeBalancerConfigs,
  ],
  (nodeBalancers, nodeBalancerConfigs) => {
    return Object.values(nodeBalancers).map(nodeBalancer => ({
      ...nodeBalancer,
      configs: Object.values(
        nodeBalancerConfigs[nodeBalancer.id]?.itemsById ?? {}
      ),
    }));
  }
);
