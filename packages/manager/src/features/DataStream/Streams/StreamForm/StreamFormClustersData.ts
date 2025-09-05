import type { Cluster } from 'src/features/DataStream/Streams/StreamForm/StreamFormClusters';

export const clusters: Cluster[] = [
  {
    label: 'prod-cluster-eu',
    id: 1,
    region: 'NL, Amsterdam',
    logGeneration: true,
  },
  {
    label: 'gke-prod-europe-west1',
    id: 2,
    region: 'US, Atalanta, GA',
    logGeneration: false,
  },
  {
    label: 'metrics-stream-cluster',
    id: 3,
    region: 'US, Chicago, IL',
    logGeneration: true,
  },
];
