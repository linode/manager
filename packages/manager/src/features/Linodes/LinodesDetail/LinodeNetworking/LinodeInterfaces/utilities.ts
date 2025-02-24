import type { LinodeInterface, LinodeInterfaceStatus } from '@linode/api-v4';

export const getLinodeInterfaceType = (networkInterface: LinodeInterface) => {
  if (networkInterface.vpc) {
    return 'vpc';
  }
  if (networkInterface.vlan) {
    return 'vlan';
  }
  return 'public';
};

export const humanizeLinodeInterfaceStatus = (
  status: LinodeInterfaceStatus
) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'deleted':
      return 'Deleted';
    default:
      return '';
  }
};

export type LinodeInterfaceType = ReturnType<typeof getLinodeInterfaceType>;
