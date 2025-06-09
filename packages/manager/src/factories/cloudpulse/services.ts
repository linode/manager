import { Factory, regionFactory } from '@linode/utilities';

import type { Service, ServiceAlert } from '@linode/api-v4';

export const serviceAlertFactory = Factory.Sync.makeFactory<ServiceAlert>({
  polling_interval_seconds: [10, 20, 30],
  evaluation_periods_seconds: [10, 20, 30],
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
