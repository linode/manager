import { serviceTypesFactory } from 'src/factories';

import { getServiceTypeLabel } from './utils';

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
