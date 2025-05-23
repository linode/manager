import {
  createNodeBalancer,
  deleteNodeBalancer,
  getNodeBalancerFirewalls,
  getNodeBalancers,
  getNodeBalancerStats,
  getNodeBalancerTypes,
  updateNodeBalancer,
} from './handlers/nodebalancers';

import type { MockPresetCrud } from 'src/mocks/types';

export const nodeBalancerCrudPreset: MockPresetCrud = {
  group: { id: 'NodeBalancers' },
  handlers: [
    createNodeBalancer,
    getNodeBalancers,
    getNodeBalancerTypes,
    getNodeBalancerStats,
    updateNodeBalancer,
    deleteNodeBalancer,
    getNodeBalancerFirewalls,
  ],
  id: 'nodebalancers:crud',
  label: 'NodeBalancers CRUD',
};
