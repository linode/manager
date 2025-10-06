import type { AccountVPCAdmin, GrantLevel } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const vpcGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<AccountVPCAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false
  return {
    create_vpc: unrestricted || grantLevel === 'read_write',
    create_vpc_subnet: unrestricted || grantLevel === 'read_write',
    delete_vpc: unrestricted || grantLevel === 'read_write',
    delete_vpc_subnet: unrestricted || grantLevel === 'read_write',
    update_vpc: unrestricted || grantLevel === 'read_write',
    update_vpc_subnet: unrestricted || grantLevel === 'read_write',
    list_vpc_ip_addresses: unrestricted || grantLevel !== null,
    view_vpc: unrestricted || grantLevel !== null,
    view_vpc_subnet: unrestricted || grantLevel !== null,
  };
};
