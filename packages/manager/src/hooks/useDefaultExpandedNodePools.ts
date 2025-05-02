import * as React from 'react';

import { storage } from 'src/utilities/storage';

import type { KubeNodePoolResponse } from '@linode/api-v4';

export const useDefaultExpandedNodePools = (
  clusterID: number,
  pools: KubeNodePoolResponse[] | undefined
) => {
  const [expandedAccordions, _setExpandedAccordions] = React.useState<
    number[] | undefined
  >(storage.nodePoolsExpanded.get(clusterID) ?? undefined);

  const defaultExpandedPools =
    pools
      ?.filter((pool) => {
        // If there's only one node pool, expand it no matter how many nodes there are
        if (pools.length === 1) {
          return true;
        }
        // If there are more than 3 node pools, keep them all collapsed
        if (pools.length > 3) {
          return false;
        }
        // Otherwise, if the user has between 1-3 node pools:
        // If the node pool has <10 nodes, keep it expanded
        if (pool.count < 10) {
          return true;
        }
        // Collapse everything else
        return false;
      })
      .map(({ id }) => id) ?? [];

  const setExpandedAccordions = (expandedAccordions: number[]) => {
    storage.nodePoolsExpanded.set(clusterID, expandedAccordions);
    _setExpandedAccordions(expandedAccordions);
  };

  const handleAccordionClick = (id: number) => {
    let _expandedAccordions;

    // Initial load with no saved local storage
    if (expandedAccordions === undefined) {
      if (defaultExpandedPools.includes(id)) {
        _expandedAccordions = defaultExpandedPools.filter(
          (poolId) => poolId !== id
        );
      } else {
        _expandedAccordions = [...defaultExpandedPools, id];
      }
      return setExpandedAccordions(_expandedAccordions);
    }

    if (expandedAccordions.includes(id)) {
      _expandedAccordions = expandedAccordions.filter(
        (number) => number !== id
      );
    } else {
      _expandedAccordions = [...expandedAccordions, id];
    }

    setExpandedAccordions(_expandedAccordions);
  };

  return {
    defaultExpandedPools,
    expandedAccordions,
    handleAccordionClick,
    setExpandedAccordions,
  };
};
