import * as Factory from 'factory.ts';
import { LinodeInterface } from '@linode/api-v4/lib/linodes/types';

export const linodeInterfacesFactory = Factory.Sync.makeFactory<LinodeInterface>(
  {
    id: Factory.each((i) => i),
    type: 'additional',
    description: 'Test interface',
    linode_id: 5,
    vlan_id: Factory.each((i) => i),
    mac_address: 'a4:ac:39:b7:6e:42',
    ip_address: '10.0.0.1/24',
  }
);
