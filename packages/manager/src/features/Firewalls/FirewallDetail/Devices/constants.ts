import type { FirewallDeviceEntityType } from '@linode/api-v4';

export const formattedTypes: Record<FirewallDeviceEntityType, string> = {
  interface: 'Linode Interface',
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};
