import { Factory, regionFactory } from '@linode/utilities';

import type { Service, ServiceAlert } from '@linode/api-v4';

export const serviceAlertFactory = Factory.Sync.makeFactory<ServiceAlert>({
  evaluation_periods_seconds: [300, 900, 1800, 3600],
  polling_interval_seconds: [300, 900, 1800, 3600],
  scope: ['account', 'entity', 'region'],
});

export const serviceTypesFactory = Factory.Sync.makeFactory<Service>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => `Factory ServiceType-${i}`),
  is_beta: true,
  regions: regionFactory
    .buildList(3)
    .map(({ id }) => id)
    .join(','),
  alert: serviceAlertFactory.build(),
});
