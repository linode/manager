import { Factory, regionFactory } from '@linode/utilities';

import type {
  CloudPulseServiceType,
  Service,
  ServiceAlert,
} from '@linode/api-v4';

const serviceTypes: CloudPulseServiceType[] = [
  'linode',
  'nodebalancer',
  'dbaas',
  'firewall',
  'objectstorage',
];

export const serviceAlertFactory = Factory.Sync.makeFactory<ServiceAlert>({
  evaluation_period_seconds: [300, 900, 1800, 3600],
  polling_interval_seconds: [300, 900, 1800, 3600],
  scope: ['account', 'entity', 'region'],
});

export const serviceTypesFactory = Factory.Sync.makeFactory<Service>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => serviceTypes[i % 4]),
  regions: regionFactory
    .buildList(3)
    .map(({ id }) => id)
    .join(','),
  alert: serviceAlertFactory.build(),
});
