import type { FirewallDeviceEntityType } from '@linode/api-v4';

export const formattedTypes: Record<FirewallDeviceEntityType, string> = {
  interface: 'Interface',
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};
