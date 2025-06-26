import { Factory } from '@linode/utilities';

import type { TrustedDevice } from '@linode/api-v4/lib/profile/types';

export const trustedDeviceFactory = Factory.Sync.makeFactory<TrustedDevice>({
  created: '2020-01-01T12:00:00',
  expiry: '2026-01-01T12:00:00',
  id: Factory.each((i) => i),
  last_authenticated: '2020-01-01T12:00:00',
  last_remote_addr: '127.0.0.1',
  user_agent: Factory.each((i) => `test-user-agent-${i}`),
});
