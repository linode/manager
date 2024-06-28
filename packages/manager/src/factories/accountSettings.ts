import { AccountSettings } from '@linode/api-v4/lib/account/types';
import Factory from '@factory';

export const accountSettingsFactory = Factory.Sync.makeFactory<AccountSettings>(
  {
    backups_enabled: false,
    longview_subscription: null,
    managed: false,
    network_helper: false,
    object_storage: 'active',
  }
);
