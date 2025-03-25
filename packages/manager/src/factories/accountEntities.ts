import { Factory } from '@linode/utilities';

import type { IamAccountEntities } from '@linode/api-v4';

export const accountEntitiesFactory = Factory.Sync.makeFactory<IamAccountEntities>(
  {
    data: [
      {
        id: 7,
        label: 'linode7',
        type: 'linode',
      },
      {
        id: 1,
        label: 'linode1',
        type: 'linode',
      },
      {
        id: 2,
        label: 'linode2',
        type: 'linode',
      },
      {
        id: 3,
        label: 'linode3',
        type: 'linode',
      },
      {
        id: 4,
        label: 'linode4',
        type: 'linode',
      },
      {
        id: 5,
        label: 'linode5',
        type: 'linode',
      },
      {
        id: 6,
        label: 'linode6',
        type: 'linode',
      },
      {
        id: 8,
        label: 'linode8',
        type: 'linode',
      },
      {
        id: 10,
        label: 'linode10',
        type: 'linode',
      },
      {
        id: 1,
        label: 'no_devices',
        type: 'firewall',
      },
      {
        id: 2,
        label: 'active_with_nodebalancer',
        type: 'firewall',
      },
      {
        id: 1,
        label: 'nodebalancer-active',
        type: 'nodebalancer',
      },
      {
        id: 1,
        label: 'active',
        type: 'longview',
      },
      {
        id: 3,
        label: 'LongviewClientTest',
        type: 'longview',
      },
      {
        id: 1,
        label: 'linDomTest1.com',
        type: 'domain',
      },
      {
        id: 1,
        label: 'API Test',
        type: 'stackscript',
      },
      {
        id: 1,
        label: 'Test image - mine',
        type: 'image',
      },
      {
        id: 3,
        label: 'Test image - mine - creating',
        type: 'image',
      },
      {
        id: 1,
        label: 'volume1',
        type: 'volume',
      },
      {
        id: 1,
        label: 'mongo_cluster',
        type: 'database',
      },
      {
        id: 3,
        label: 'empty-vpc',
        type: 'vpc',
      },
    ],
  }
);
