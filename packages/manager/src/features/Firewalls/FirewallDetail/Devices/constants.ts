import type { FirewallDeviceEntityType } from '@linode/api-v4';

export const formattedTypes: Record<FirewallDeviceEntityType, string> = {
  linode_interface: 'Linode Interface',
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};
