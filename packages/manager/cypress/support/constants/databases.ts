import type {
  ClusterSize,
  Engine,
  Region,
  DatabaseEngine,
  DatabaseType,
} from '@linode/api-v4';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { databaseEngineFactory, databaseTypeFactory } from '@src/factories';

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

// The database type IDs in this array should correspond to the DBaaS cluster
// `linodeType` values used by the tests.
export const mockDatabaseNodeTypes: DatabaseType[] = [
  databaseTypeFactory.build({
    class: 'nanode',
    id: 'g6-nanode-1',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-2',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-4',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-6',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-8',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-16',
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-4',
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-8',
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-16',
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-32',
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
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '8',
  },
  {
    clusterSize: 3,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-dedicated-2',
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
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
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '13',
  },
];

export const databaseConfigurationsResize: databaseClusterConfiguration[] = [
  {
    clusterSize: 3,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-standard-16',
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '8',
  },
  {
    clusterSize: 3,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-dedicated-8',
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '5',
  },
];

