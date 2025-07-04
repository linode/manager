import type { Cluster } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateClusters';

export const clusters: Cluster[] = [
  {
    label: 'prod-cluster-eu',
    id: 1,
    region: 'NL, Amsterdam',
    logGeneration: true,
    isChecked: false,
  },
  {
    label: 'gke-prod-europe-west1',
    id: 2,
    region: 'US, Atalanta, GA',
    logGeneration: false,
    isChecked: false,
  },
  {
    label: 'metrics-stream-cluster',
    id: 3,
    region: 'US, Chicago, IL',
    logGeneration: true,
    isChecked: false,
  },
];
