import { Factory } from '@linode/utilities';

import type { Apps, LongviewClient } from '@linode/api-v4/lib/longview';

export const longviewAppsFactory = Factory.Sync.makeFactory<Apps>({
  apache: false,
  mysql: false,
  nginx: false,
});

export const longviewClientFactory = Factory.Sync.makeFactory<LongviewClient>({
  api_key: 'EXAMPLE_API_KEY',
  apps: longviewAppsFactory.build(),
  created: new Date().toDateString(),
  id: Factory.each((id) => id),
  install_code: 'INSTALL_ME',
  label: Factory.each((i) => `longview-client-${i}`),
  updated: new Date().toDateString(),
});
