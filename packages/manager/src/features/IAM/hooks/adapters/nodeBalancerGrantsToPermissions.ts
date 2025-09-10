import type { GrantLevel, NodeBalancerAdmin } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const nodeBalancerGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<NodeBalancerAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false
  return {
    delete_nodebalancer: unrestricted || grantLevel === 'read_write',
    delete_nodebalancer_config: unrestricted || grantLevel === 'read_write',
    delete_nodebalancer_config_node:
      unrestricted || grantLevel === 'read_write',
    update_nodebalancer: unrestricted || grantLevel === 'read_write',
    create_nodebalancer_config: unrestricted || grantLevel === 'read_write',
    update_nodebalancer_config: unrestricted || grantLevel === 'read_write',
    rebuild_nodebalancer_config: unrestricted || grantLevel === 'read_write',
    create_nodebalancer_config_node:
      unrestricted || grantLevel === 'read_write',
    update_nodebalancer_config_node:
      unrestricted || grantLevel === 'read_write',
    update_nodebalancer_firewalls: unrestricted || grantLevel === 'read_write',
    view_nodebalancer: unrestricted || grantLevel !== null,
    list_nodebalancer_firewalls: unrestricted || grantLevel !== null,
    view_nodebalancer_statistics: unrestricted || grantLevel !== null,
    list_nodebalancer_configs: unrestricted || grantLevel !== null,
    view_nodebalancer_config: unrestricted || grantLevel !== null,
    list_nodebalancer_config_nodes: unrestricted || grantLevel !== null,
    view_nodebalancer_config_node: unrestricted || grantLevel !== null,
  };
};
