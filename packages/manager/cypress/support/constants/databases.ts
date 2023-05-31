import { ClusterSize, Engine } from '@linode/api-v4/types';
import { randomLabel } from 'support/util/random';
import type { CloudRegion } from 'support/util/regions';
import { chooseRegion } from 'support/util/regions';

interface databaseClusterConfiguration {
  label: string;
  linodeType: string;
  clusterSize: ClusterSize;
  dbType: Engine;
  region: CloudRegion;
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
    region: chooseRegion(),
    engine: 'MySQL',
    version: '8',
  },
  {
    label: randomLabel(),
    linodeType: 'g6-dedicated-16',
    clusterSize: 3,
    dbType: 'mysql',
    region: chooseRegion(),
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
    region: chooseRegion(),
    engine: 'PostgreSQL',
    version: '13',
  },
];

export { databaseClusterConfiguration, databaseConfigurations };
