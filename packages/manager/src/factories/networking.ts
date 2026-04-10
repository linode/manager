import { Factory } from '@linode/utilities';

import type { IPAddress } from '@linode/api-v4/lib/networking';

export const ipAddressFactory = Factory.Sync.makeFactory<IPAddress>({
  address: Factory.each((id) => `192.168.1.${id}`),
  assigned_entity: null,
  gateway: Factory.each((id) => `192.168.1.${id + 1}`),
  interface_id: Factory.each((id) => id),
  linode_id: Factory.each((id) => id),
  prefix: 24,
  public: true,
  rdns: null,
  region: 'us-east',
  subnet_mask: Factory.each((id) => `192.168.1.${id + 3}`),
  type: 'ipv4',
  reserved: false,
  tags: [],
});

const REGIONS = ['pl-labkrk-2', 'us-labedgeeat-2', 'us-labedgeeat-3'];
const SAMPLE_TAGS = [
  ['web', 'production', 'db', 'staging', 'lb', 'api', 'internal'],
  ['db', 'staging'],
  ['lb'],
  ['api', 'internal'],
  [],
];
const SAMPLE_ENTITIES: Array<IPAddress['assigned_entity']> = [
  {
    id: 1,
    label: 'web-server-01',
    type: 'linode',
    url: '/v4/linode/instances/1',
  },
  {
    id: 2,
    label: 'ubuntu-pl-labkrk-2',
    type: 'linode',
    url: '/v4/linode/instances/2',
  },
  null,
  {
    id: 5,
    label: 'my-nodebalancer',
    type: 'nodebalancer',
    url: '/v4/nodebalancers/5',
  },
  null,
];

export const reservedIPsFactory = Factory.Sync.makeFactory<IPAddress>({
  address: Factory.each((id) => `203.0.113.${id}`),
  assigned_entity: Factory.each(
    (id) => SAMPLE_ENTITIES[id % SAMPLE_ENTITIES.length]
  ),
  gateway: '203.0.113.1',
  interface_id: null,
  linode_id: Factory.each((id) => {
    const entity = SAMPLE_ENTITIES[id % SAMPLE_ENTITIES.length];
    return entity?.type === 'linode' ? entity.id : null;
  }),
  prefix: 24,
  public: true,
  rdns: '172-24-226-80.ip.linodeusercontent.com',
  region: Factory.each((id) => REGIONS[id % REGIONS.length]),
  reserved: true,
  subnet_mask: '255.255.255.0',
  tags: Factory.each((id) => SAMPLE_TAGS[id % SAMPLE_TAGS.length]),
  type: 'ipv4',
});
