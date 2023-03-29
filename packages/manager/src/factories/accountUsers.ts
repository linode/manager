import { User } from '@linode/api-v4';
import * as Factory from 'factory.ts';

export const accountUserFactory = Factory.Sync.makeFactory<User>({
  email: 'user@example.com',
  restricted: true,
  ssh_keys: [],
  tfa_enabled: false,
  username: 'user',
  verified_phone_number: null,
});
