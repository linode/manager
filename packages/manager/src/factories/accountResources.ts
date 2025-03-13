import { Factory } from '@linode/utilities';

import type { IamAccountResource } from '@linode/api-v4';

export const accountResourcesFactory = Factory.Sync.makeFactory<
  IamAccountResource[]
>([
  {
    resource_type: 'linode',
    resources: [
      {
        id: 12345678,
        name: 'debian-us-123',
      },
      {
        id: 23456789,
        name: 'linode-uk-123',
      },
      {
        id: 1,
        name: 'debian-us-1',
      },
      {
        id: 2,
        name: 'linode-uk-1',
      },
      {
        id: 3,
        name: 'debian-us-2',
      },
      {
        id: 4,
        name: 'linode-uk-2',
      },
      {
        id: 5,
        name: 'debian-us-3',
      },
      {
        id: 6,
        name: 'linode-uk-3',
      },
      {
        id: 7,
        name: 'debian-us-4',
      },
      {
        id: 8,
        name: 'linode-uk-4',
      },
    ],
  },
  {
    resource_type: 'firewall',
    resources: [
      {
        id: 45678901,
        name: 'firewall-us-123',
      },
    ],
  },
  {
    resource_type: 'image',
    resources: [
      {
        id: 65789745,
        name: 'image-us-123',
      },
    ],
  },
  {
    resource_type: 'vpc',
    resources: [
      {
        id: 7654321,
        name: 'vpc-us-123',
      },
    ],
  },
  {
    resource_type: 'volume',
    resources: [
      {
        id: 890357,
        name: 'volume-us-123',
      },
    ],
  },
  {
    resource_type: 'nodebalancer',
    resources: [
      {
        id: 4532187,
        name: 'nodebalancer-us-123',
      },
    ],
  },
  {
    resource_type: 'longview',
    resources: [
      {
        id: 432178973,
        name: 'longview-us-123',
      },
    ],
  },
  {
    resource_type: 'domain',
    resources: [
      {
        id: 5437894,
        name: 'domain-us-123',
      },
    ],
  },
  {
    resource_type: 'stackscript',
    resources: [
      {
        id: 654321789,
        name: 'stackscript-us-123',
      },
    ],
  },
  {
    resource_type: 'database',
    resources: [
      {
        id: 643218965,
        name: 'database-us-123',
      },
    ],
  },
]);
