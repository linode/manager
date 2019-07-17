export const clusters: Linode.KubernetesCluster[] = [
  {
    tags: ['spam', 'eggs'],
    region: 'us-central',
    label: 'cluster-1',
    node_pools: [
      {
        type: 'g6-standard-4',
        count: 2,
        id: 69,
        linodes: [
          {
            id: 103,
            status: 'ready'
          },
          {
            id: 104,
            status: 'ready'
          }
        ]
      },
      {
        type: 'g6-standard-8',
        count: 1,
        id: 70,
        linodes: [
          {
            id: 105,
            status: 'ready'
          }
        ]
      }
    ],
    created: '2019-04-29 18:02:17',
    id: 35,
    status: 'running',
    version: '1.13.5'
  },
  {
    tags: ['spam', 'eggs'],
    region: 'us-central',
    label: 'cluster-2',
    node_pools: [
      {
        type: 'g6-standard-4',
        count: 2,
        id: 69,
        linodes: [
          {
            id: 103,
            status: 'ready'
          },
          {
            id: 104,
            status: 'ready'
          }
        ]
      },
      {
        type: 'g6-standard-8',
        count: 1,
        id: 70,
        linodes: [
          {
            id: 105,
            status: 'ready'
          }
        ]
      }
    ],
    created: '2019-04-29 18:02:17',
    id: 34,
    status: 'running',
    version: '1.13.5'
  }
];

export const extendedClusters = clusters.map(cluster => {
  return {
    ...cluster,
    totalMemory: 10,
    totalCPU: 2
  };
});
