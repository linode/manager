import { renderHook } from '@testing-library/react';

import {
  kubeLinodeFactory,
  nodePoolFactory,
} from 'src/factories/kubernetesCluster';

import { useDefaultExpandedNodePools } from './useDefaultExpandedNodePools';

const clusterID = 1;

describe('useDefaultExpandedNodePools', () => {
  it('returns a single node pool as the default expanded pool', () => {
    const singleNodePool = [
      nodePoolFactory.build({
        count: 50,
        id: 100,
        nodes: kubeLinodeFactory.buildList(50),
      }),
    ];

    const { result } = renderHook(() =>
      useDefaultExpandedNodePools(clusterID, singleNodePool)
    );

    expect(result.current.defaultExpandedPools).toStrictEqual([100]);
  });

  it('returns node pools with less than 10 nodes as the default expanded pools if the user has between 1-3 node pools', () => {
    const nodePools = [
      nodePoolFactory.build({
        count: 1,
        id: 100,
        nodes: [kubeLinodeFactory.build()],
      }),
      nodePoolFactory.build({
        count: 10,
        id: 101,
        nodes: kubeLinodeFactory.buildList(10),
      }),
      nodePoolFactory.build({
        count: 6,
        id: 102,
        nodes: kubeLinodeFactory.buildList(6),
      }),
    ];

    const { result } = renderHook(() =>
      useDefaultExpandedNodePools(clusterID, nodePools)
    );

    expect(result.current.defaultExpandedPools).toStrictEqual([100, 102]);
  });

  it('returns no default expanded pools if the user has more than 3 node pools', () => {
    const nodePools = nodePoolFactory.buildList(10);

    const { result } = renderHook(() =>
      useDefaultExpandedNodePools(clusterID, nodePools)
    );

    expect(result.current.defaultExpandedPools).toStrictEqual([]);
  });
});
