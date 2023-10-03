import {
  ClusterSize,
  Engine,
  Region,
  DatabaseEngine,
} from '@linode/api-v4/types';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { databaseEngineFactory } from '@src/factories';

export interface databaseClusterConfiguration {
  clusterSize: ClusterSize;
  dbType: Engine;
  engine: string;
  label: string;
  linodeType: string;
  region: Region;
  version: string;
}

/**
 * Array of common database engine types that can be used for mocking.
 */
export const mockDatabaseEngineTypes: DatabaseEngine[] = [
  databaseEngineFactory.build({
    engine: 'mysql',
    version: '5',
    deprecated: false,
  }),
  databaseEngineFactory.build({
    engine: 'mysql',
    version: '8',
    deprecated: false,
  }),
  databaseEngineFactory.build({
    engine: 'postgresql',
    version: '13',
    deprecated: false,
  }),
];

// Array of database cluster configurations for which to test creation.
export const databaseConfigurations: databaseClusterConfiguration[] = [
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
