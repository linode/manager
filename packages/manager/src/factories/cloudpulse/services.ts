import { Factory } from '@linode/utilities';

import type { ServiceTypes } from '@linode/api-v4';

export const serviceTypesFactory = Factory.Sync.makeFactory<ServiceTypes>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => `Factory ServiceType-${i}`),
  is_beta: false,
  regions: 'us-ord,us-east',
  alert: {
    polling_interval_seconds: [1, 5, 10, 15],
    evaluation_periods_seconds: [5, 10, 15, 20],
    scope: ['entity', 'region', 'account'],
  },
});
