import {
  getNodeBalancerConfigNodes,
  getNodeBalancerConfigs,
} from '@linode/api-v4';

import { parseAddresses } from "../utils";

/**
 * A function to fetch data for the NodeBalancerConfigurations page.
 * When we refactor NodeBalancerConfigurations to not be total chaos,
 * this may change.
 */
export const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then((configs) => {
    return Promise.all(
      configs.data.map((config) => {
        return getNodeBalancerConfigNodes(nodeBalancerId, config.id).then(
          ({ data: nodes }) => {
            return {
              ...config,
              nodes: parseAddresses(nodes),
            };
          }
        );
      })
    );
  });
};

export type ConfigsWithNodes = Awaited<ReturnType<typeof getConfigsWithNodes>>;