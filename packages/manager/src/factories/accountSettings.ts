import { Factory } from '@linode/utilities';

import type { AccountSettings } from '@linode/api-v4/lib/account/types';

export const accountSettingsFactory = Factory.Sync.makeFactory<AccountSettings>(
  {
    backups_enabled: false,
    interfaces_for_new_linodes: 'legacy_config_only',
    longview_subscription: null,
    maintenance_policy_id: 1,
    managed: false,
    network_helper: false,
    object_storage: 'active',
  }
);
