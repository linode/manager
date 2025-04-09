import type { LinodeInterface } from '@linode/api-v4';

export const getLinodeInterfaceType = (networkInterface: LinodeInterface) => {
  if (networkInterface.vpc) {
    return 'vpc';
  }
  if (networkInterface.vlan) {
    return 'vlan';
  }
  return 'public';
};

export type LinodeInterfaceType = ReturnType<typeof getLinodeInterfaceType>;
