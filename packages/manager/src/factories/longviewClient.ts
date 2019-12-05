import * as Factory from 'factory.ts';
import { Apps, LongviewClient } from 'linode-js-sdk/lib/longview';

export const longviewAppsFactory = Factory.Sync.makeFactory<Apps>({
  nginx: false,
  mysql: false,
  apache: false
});

export const longviewClientFactory = Factory.Sync.makeFactory<LongviewClient>({
  id: Factory.each(id => id),
  created: new Date().toDateString(),
  updated: new Date().toDateString(),
  label: Factory.each(i => `longview-client-${i}`),
  api_key: 'EXAMPLE_API_KEY',
  apps: longviewAppsFactory.build(),
  install_code: 'INSTALL_ME'
});
