import * as Factory from 'factory.ts';
import { AccountSettings } from '@linode/api-v4/lib/account/types';

export const accountSettingsFactory = Factory.Sync.makeFactory<AccountSettings>(
  {
    longview_subscription: null,
    managed: false,
    network_helper: false,
    backups_enabled: false,
    object_storage: 'active',
  }
);
