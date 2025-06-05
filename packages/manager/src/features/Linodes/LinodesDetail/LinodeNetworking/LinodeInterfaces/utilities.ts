import type { LinodeInterface } from '@linode/api-v4';

export const getLinodeInterfaceType = (networkInterface: LinodeInterface) => {
  if (networkInterface.vpc) {
    return 'VPC';
  }
  if (networkInterface.vlan) {
    return 'VLAN';
  }
  return 'Public';
};

export type LinodeInterfaceType = ReturnType<typeof getLinodeInterfaceType>;
