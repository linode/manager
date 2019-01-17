import { createSelector } from 'reselect';

export const nodeBalancersWithConfigs = createSelector(
  [
    (nodeBalancers: ApplicationState['__resources']['nodeBalancers']) => nodeBalancers.nodeBalancers,
    (nodeBalancers: ApplicationState['__resources']['nodeBalancers']) => nodeBalancers.nodeBalancerConfigs,
  ],
  (nodeBalancers, nodeBalancerConfigs) => {
    return Object
      .values(nodeBalancers)
      .map((nodeBalancer) => ({
        ...nodeBalancer,
        configs: (nodeBalancer.configs || []).map((id) => nodeBalancerConfigs[id]),
      }))
  }
);
