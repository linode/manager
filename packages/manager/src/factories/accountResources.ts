import { IamAccountResource } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

export const accountResourcesFactory = Factory.Sync.makeFactory<IamAccountResource>(
  [
    {
      resource_type: 'linode',
      resources: [
        {
          name: 'debian-us-123',
          id: 12345678,
        },
        {
          name: 'linode-uk-123',
          id: 23456789,
        },
      ],
    },
    {
      resource_type: 'firewall',
      resources: [
        {
          name: 'firewall-us-123',
          id: 45678901,
        },
      ],
    },
  ]
);
