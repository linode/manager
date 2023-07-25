import { ClusterSize, Engine, Region } from '@linode/api-v4/types';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

interface databaseClusterConfiguration {
  clusterSize: ClusterSize;
  dbType: Engine;
  engine: string;
  label: string;
  linodeType: string;
  region: Region;
  version: string;
}

// Array of database cluster configurations for which to test creation.
const databaseConfigurations: databaseClusterConfiguration[] = [
  {
    clusterSize: 1,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    region: chooseRegion(),
    version: '8',
  },
  {
    clusterSize: 3,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-dedicated-16',
    region: chooseRegion(),
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
    clusterSize: 3,
    dbType: 'postgresql',
    engine: 'PostgreSQL',
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    region: chooseRegion(),
    version: '13',
  },
];

export { databaseClusterConfiguration, databaseConfigurations };
