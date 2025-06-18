import { toPermissionMap } from './permissionAdapters';

import type { PermissionType } from '@linode/api-v4';

describe('toPermissionMap', () => {
  it('should map AccountAdmin permissions correctly', () => {
    const permissionsToCheck: PermissionType[] = [
      'cancel_account',
      'create_user',
      'update_account',
      'view_account',
    ];
    const usersPermissions: PermissionType[] = [
      'cancel_account',
      'create_user',
      'view_account',
    ];
    const result = toPermissionMap(permissionsToCheck, usersPermissions);
    expect(result).toEqual({
      cancel_account: true,
      create_user: true,
      update_account: false,
      view_account: true,
    });
  });

  it('should map LinodeContributor permissions correctly', () => {
    const permissionsToCheck: PermissionType[] = [
      // These are LinodeContributor permissions
      'boot_linode',
      'apply_linode_firewalls',
      'resize_linode',
    ];
    const usersPermissions: PermissionType[] = ['boot_linode', 'resize_linode'];
    const result = toPermissionMap(permissionsToCheck, usersPermissions);
    expect(result).toEqual({
      boot_linode: true,
      apply_linode_firewalls: false,
      resize_linode: true,
    });
  });
});
