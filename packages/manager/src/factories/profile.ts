import * as Factory from 'factory.ts';
import { Profile } from '@linode/api-v4/lib/profile/types';

export const profileFactory = Factory.Sync.makeFactory<Profile>({
  uid: 9999,
  username: 'mock-user',
  email: 'mock-user@linode.com',
  timezone: 'Asia/Shanghai',
  referrals: {
    code: 'XXX',
    url: 'https://www.linode.com/XXX',
    total: 0,
    completed: 0,
    pending: 0,
    credit: 0,
  },
  email_notifications: false,
  ip_whitelist_enabled: false,
  lish_auth_method: 'keys_only',
  authorized_keys: [],
  two_factor_auth: false,
  restricted: false,
  authentication_type: 'password',
});
