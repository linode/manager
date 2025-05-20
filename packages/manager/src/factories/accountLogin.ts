import { Factory } from '@linode/utilities';

import type { AccountLogin } from '@linode/api-v4';

export const accountLoginFactory = Factory.Sync.makeFactory<AccountLogin>({
  datetime: '2021-05-21T14:27:51',
  id: Factory.each((id) => id),
  ip: '127.0.0.1',
  restricted: false,
  status: 'successful',
  username: 'mock-user',
});
