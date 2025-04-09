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
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.0225,
            monthly: 15,
          },
          quantity: 3,
        },
      ],
    },
    memory: 1024,
    disk: 25600,
    vcpus: 1,
    label: 'Nanode 1 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-2',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.2925,
            monthly: 195,
          },
          quantity: 3,
        },
      ],
    },
    memory: 4096,
    disk: 81920,
    vcpus: 2,
    label: 'Dedicated 4 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-4',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.585,
            monthly: 390.0,
          },
          quantity: 3,
        },
      ],
    },
    memory: 8192,
    disk: 163840,
    vcpus: 4,
    label: 'Dedicated 8 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-8',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 1.17,
            monthly: 780,
          },
          quantity: 3,
        },
      ],
    },
    memory: 16384,
    disk: 327680,
    vcpus: 6,
    label: 'Dedicated 16 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-16',
    engines: {
      mysql: [
        {
          price: {
            hourly: 2.34,
            monthly: 1560.0,
          },
          quantity: 3,
        },
      ],
    },
    memory: 32768,
    disk: 655360,
    vcpus: 8,
    label: 'Dedicated 32 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-32',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 4.68,
            monthly: 3120.0,
          },
          quantity: 3,
        },
      ],
    },
    memory: 65536,
    disk: 1310720,
    vcpus: 16,
    label: 'Dedicated 64 GB',
  }),
  databaseTypeFactory.build({
    class: 'dedicated',
    id: 'g6-dedicated-48',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 7.02,
            monthly: 4680,
          },
          quantity: 3,
        },
      ],
    },
    memory: 98304,
    disk: 1966080,
    vcpus: 20,
    label: 'Dedicated 96 GB',
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-1',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.09,
            monthly: 60,
          },
          quantity: 3,
        },
      ],
    },
    disk: 51200,
    label: 'Linode 2 GB',
    memory: 2048,
    vcpus: 1,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-2',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.18,
            monthly: 120,
          },
          quantity: 3,
        },
      ],
    },
    disk: 81920,
    label: 'Linode 4 GB',
    memory: 4096,
    vcpus: 2,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-4',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.36,
            monthly: 240,
          },
          quantity: 3,
        },
      ],
    },
    disk: 163840,
    label: 'Linode 8 GB',
    memory: 8192,
    vcpus: 4,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-6',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 0.84,
            monthly: 560.0,
          },
          quantity: 3,
        },
      ],
    },
    disk: 327680,
    label: 'Linode 16 GB',
    memory: 16384,
    vcpus: 6,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-8',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 1.68,
            monthly: 1120.0,
          },
          quantity: 3,
        },
      ],
    },
    disk: 655360,
    label: 'Linode 32 GB',
    memory: 32768,
    vcpus: 8,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-16',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 3.336,
            monthly: 2224.0,
          },
          quantity: 3,
        },
      ],
    },
    disk: 1310720,
    label: 'Linode 64 GB',
    memory: 65536,
    vcpus: 16,
  }),
  databaseTypeFactory.build({
    class: 'standard',
    id: 'g6-standard-20',
    engines: {
      mysql: [
        {
          price: {
            // (Insert your desired price here)
            hourly: 5.04,
            monthly: 3360.0,
          },
          quantity: 3,
        },
      ],
    },
    disk: 1966080,
    label: 'Linode 96 GB',
    memory: 98304,
    vcpus: 20,
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
    linodeType: 'g6-standard-6',
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '8',
  },
  {
    clusterSize: 3,
    dbType: 'mysql',
    engine: 'MySQL',
    label: randomLabel(),
    linodeType: 'g6-dedicated-16',
    region: chooseRegion({ capabilities: ['Managed Databases'] }),
    version: '5',
  },
];
