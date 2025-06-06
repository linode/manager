import { Factory } from '@linode/utilities';

import type { ServiceTypes } from '@linode/api-v4';

export const serviceTypesFactory = Factory.Sync.makeFactory<ServiceTypes>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => `Factory ServiceType-${i}`),
  alert: {
    evaluation_periods_seconds: [300, 900, 1800, 3600],
    polling_interval_seconds: [300, 900, 1800, 3600],
    scope: [],
  },
  is_beta: false,
  regions: '',
});
