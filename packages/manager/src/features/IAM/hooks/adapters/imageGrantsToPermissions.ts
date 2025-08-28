import type { GrantLevel, ImageAdmin } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const imageGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<ImageAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  return {
    delete_image: unrestricted || grantLevel === 'read_write',
    replicate_image: unrestricted || grantLevel === 'read_write',
    update_image: unrestricted || grantLevel === 'read_write',
    view_image: unrestricted || grantLevel !== null,
  };
};
