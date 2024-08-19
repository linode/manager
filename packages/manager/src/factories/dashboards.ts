import Factory from 'src/factories/factoryProxy';

import type { Dashboard } from '@linode/api-v4';

export const dashboardFactory = Factory.Sync.makeFactory<Dashboard>({
  created: new Date().toISOString(),
  id: Factory.each((i) => i),
  label: Factory.each((i) => `Factory Dashboard-${i}`),
  service_type: 'linode',
  time_duration: {
    unit: 'min',
    value: 30,
  },
  updated: new Date().toISOString(),
  widgets: [],
});
