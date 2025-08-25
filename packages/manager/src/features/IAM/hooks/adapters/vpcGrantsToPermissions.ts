import type { AccountVPCAdmin, GrantLevel } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const vpcGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<AccountVPCAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false
  return {
    create_vpc: unrestricted || grantLevel === 'read_write',
    create_vpc_subnet: unrestricted,
    delete_vpc: unrestricted,
    delete_vpc_subnet: unrestricted,
    update_vpc: unrestricted,
    update_vpc_subnet: unrestricted,
    list_vpc_ip_addresses: unrestricted,
    view_vpc: unrestricted,
    view_vpc_subnet: unrestricted,
  };
};
