import type { CreateLinodeInterfacePayload } from '@linode/api-v4';

/**
 * Because the new Linode Create Networking UI only allows one interface to be configured,
 * we will use a single `CreateLinodeInterfacePayload` to hold all of our state. Then, we will use
 * this function to mutate the `CreateLinodeInterfacePayload` so that only the desired values
 * are kept for the selected interface type (Public, VPC, VLAN).
 */
export const getLinodeInterfacePayload = (
  type: 'public' | 'vlan' | 'vpc',
  networkInterface: CreateLinodeInterfacePayload
) => {
  for (const key of ['public', 'vlan', 'vpc'] as const) {
    if (key !== type) {
      networkInterface[key] = null;
    }
  }

  return networkInterface;
};
