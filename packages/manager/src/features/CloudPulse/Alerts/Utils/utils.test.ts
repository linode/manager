import { serviceTypesFactory } from 'src/factories';

import { formatTimestamp, getServiceTypeLabel } from './utils';

it('test formatTimestamp method', () => {
  expect(formatTimestamp('2024-11-30T12:42:00')).toBe('Nov 30, 2024, 12:42 PM');
  expect(formatTimestamp('2023-07-15T09:30:00')).toBe('Jul 15, 2023, 9:30 AM');
});

it('test getServiceTypeLabel method', () => {
  const services = serviceTypesFactory.buildList(3);

  expect(
    getServiceTypeLabel(services[0].service_type, { data: services })
  ).toBe(services[0].label);
  expect(
    getServiceTypeLabel(services[1].service_type, { data: services })
  ).toBe(services[1].label);
  expect(
    getServiceTypeLabel(services[2].service_type, { data: services })
  ).toBe(services[2].label);
  expect(getServiceTypeLabel('test', { data: services })).toBe('test');
  expect(getServiceTypeLabel('', { data: services })).toBe('');
});
