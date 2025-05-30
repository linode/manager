import type { LinodeInterface, LinodeInterfaceStatus } from '@linode/api-v4';

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

export const humanizeLinodeInterfaceStatus = (
  status: LinodeInterfaceStatus
) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'deleted':
      return 'Deleted';
    case 'inactive':
      return 'Inactive';
    default:
      return '';
  }
};
