import { User } from '@linode/api-v4';
import * as Factory from 'factory.ts';

export const accountUserFactory = Factory.Sync.makeFactory<User>({
  email: 'support@linode.com',
  last_login: null,
  password_created: null,
  restricted: true,
  ssh_keys: [],
  tfa_enabled: false,
  user_type: null,
  username: 'user',
  verified_phone_number: null,
});
