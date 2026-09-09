import type { GrantLevel, LkeClusterAdmin } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const lkeclusterGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<LkeClusterAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false
  const hasWriteAccess = unrestricted || grantLevel === 'read_write';
  const hasReadAccess = unrestricted || grantLevel !== null;

  return {
    create_lkecluster_nodepool: hasWriteAccess,
    delete_lkecluster: hasWriteAccess,
    delete_lkecluster_control_plane_acl: hasWriteAccess,
    delete_lkecluster_nodepool: hasWriteAccess,
    delete_lkecluster_nodepool_nodes: hasWriteAccess,
    recycle_lkecluster: hasWriteAccess,
    recycle_lkecluster_nodepool: hasWriteAccess,
    recycle_lkecluster_nodepool_nodes: hasWriteAccess,
    regenerate_lkecluster: hasWriteAccess,
    update_lkecluster: hasWriteAccess,
    update_lkecluster_control_plane_acl: hasWriteAccess,
    update_lkecluster_nodepool: hasWriteAccess,
    view_lkecluster: hasReadAccess,
    view_lkecluster_api_endpoints: hasReadAccess,
    view_lkecluster_control_plane_acl: hasReadAccess,
    view_lkecluster_kubeconfig: hasWriteAccess,
    view_lkecluster_nodepool: hasReadAccess,
    view_lkecluster_nodepool_nodes: hasReadAccess,
  };
};
