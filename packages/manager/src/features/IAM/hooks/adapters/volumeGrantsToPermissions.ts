import type { GrantLevel, VolumeAdmin } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const volumeGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<VolumeAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  return {
    attach_volume: unrestricted || grantLevel === 'read_write',
    clone_volume: unrestricted || grantLevel === 'read_write',
    delete_volume: unrestricted || grantLevel === 'read_write',
    detach_volume: unrestricted || grantLevel === 'read_write',
    resize_volume: unrestricted || grantLevel === 'read_write',
    update_volume: unrestricted || grantLevel === 'read_write',
    view_volume: unrestricted || grantLevel !== null,
  };
};
