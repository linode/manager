import { capitalize } from './capitalize';

import type { Firewall } from '@linode/api-v4';

export const getFirewallDescription = (firewall: Firewall) => {
  const description = [
    `Status: ${capitalize(firewall.status)}`,
    `Services Assigned: ${firewall.entities.length}`,
  ];
  return description.join(', ');
};
