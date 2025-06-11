import { Factory } from '@linode/utilities';

import type { PermissionType } from '@linode/api-v4';

export const userAccountPermissionsFactory = Factory.Sync.makeFactory<
  PermissionType[]
>(['create_linode', 'create_firewall']);
