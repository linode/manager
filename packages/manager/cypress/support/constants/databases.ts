import { ClusterSize, Engine } from '@linode/api-v4/types';
import { randomLabel } from 'support/util/random';

interface databaseClusterConfiguration {
  label: string;
  linodeType: string;
  clusterSize: ClusterSize;
  dbType: Engine;
  region: string;
  regionTypeahead: string;
  engine: string;
  version: string;
}

// Array of database cluster configurations for which to test creation.
const databaseConfigurations: databaseClusterConfiguration[] = [
  {
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    clusterSize: 1,
    dbType: 'mysql',
    region: 'us-east',
    regionTypeahead: 'Newark',
    engine: 'MySQL',
    version: '8',
  },
  {
    label: randomLabel(),
    linodeType: 'g6-dedicated-16',
    clusterSize: 3,
    dbType: 'mysql',
    region: 'us-southeast',
    regionTypeahead: 'Atlanta',
    engine: 'MySQL',
    version: '5',
  },
  // {
  //   label: randomLabel(),
  //   linodeType: 'g6-dedicated-16',
  //   clusterSize: 1,
  //   dbType: 'mongodb',
  //   regionTypeahead: 'Atlanta',
  //   region: 'us-southeast',
  //   engine: 'MongoDB',
  //   version: '4',
  // },
  {
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    clusterSize: 3,
    dbType: 'postgresql',
    region: 'us-east',
    regionTypeahead: 'Newark',
    engine: 'PostgreSQL',
    version: '13',
  },
];

export { databaseClusterConfiguration, databaseConfigurations };
