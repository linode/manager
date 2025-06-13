import { type Service } from '@linode/api-v4';
import { Factory } from '@linode/utilities';

import type { ServiceAlert } from '@linode/api-v4';

export const serviceAlertFactory = Factory.Sync.makeFactory<ServiceAlert>({
  polling_interval_seconds: [1, 5, 10, 15],
  evaluation_periods_seconds: [5, 10, 15, 20],
  scope: ['entity', 'region', 'account'],
});

export const serviceTypesFactory = Factory.Sync.makeFactory<Service>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => `Factory ServiceType-${i}`),
  is_beta: false,
  regions: '*',
  alert: serviceAlertFactory.build(),
});
