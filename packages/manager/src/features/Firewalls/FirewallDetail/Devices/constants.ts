import type { FirewallDeviceEntityType } from '@linode/api-v4';

export const formattedTypes: Record<FirewallDeviceEntityType, string> = {
  interface: 'Interface', // @TODO Linode Interface: double check this when working on UI tickets
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};
