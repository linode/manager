import { vi } from 'vitest';

export const mockNodeBalancerActions = {
  nodeBalancerActions: {
    getAllNodeBalancersWithConfigs: vi.fn(),
    getAllNodeBalancers: vi.fn(),
    createNodeBalancer: vi.fn(),
    deleteNodeBalancer: vi.fn(),
    updateNodeBalancer: vi.fn(),
  },
};

export const modeNodeBalancerConfigActions = {
  nodeBalancerConfigActions: {
    getAllNodeBalancerConfigs: vi.fn(),
    createNodeBalancerConfig: vi.fn(),
    updateNodeBalancerConfig: vi.fn(),
    deleteNodeBalancerConfig: vi.fn(),
  },
};
