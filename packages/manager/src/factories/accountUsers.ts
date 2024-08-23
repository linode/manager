import { User } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

export const accountUserFactory = Factory.Sync.makeFactory<User>({
  email: 'support@linode.com',
  last_login: null,
  password_created: null,
  restricted: true,
  ssh_keys: [],
  tfa_enabled: false,
  user_type: 'default',
  username: Factory.each((i) => `user-${i}`),
  verified_phone_number: null,
});
