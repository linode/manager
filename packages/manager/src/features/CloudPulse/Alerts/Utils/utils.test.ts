import { serviceTypesFactory } from 'src/factories';

import { getServiceTypeLabel } from './utils';

it('test getServiceTypeLabel method', () => {
  const services = serviceTypesFactory.buildList(3);
  services.forEach((service) => {
    // validate for proper labels
    expect(getServiceTypeLabel(service.service_type, { data: services })).toBe(
      service.label
    );
  });
  expect(getServiceTypeLabel('test', { data: services })).toBe('test');
  expect(getServiceTypeLabel('', { data: services })).toBe('');
});
