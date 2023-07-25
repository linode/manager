import { AccountSettings } from '@linode/api-v4/lib/account/types';
import * as Factory from 'factory.ts';

export const accountSettingsFactory = Factory.Sync.makeFactory<AccountSettings>(
  {
    backups_enabled: false,
    longview_subscription: null,
    managed: false,
    network_helper: false,
    object_storage: 'active',
  }
);
