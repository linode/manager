import { alertFactory, serviceTypesFactory } from 'src/factories';

import {
  convertAlertsToTypeSet,
  convertSecondsToMinutes,
  filterAlertsByStatusAndType,
  getServiceTypeLabel,
} from './utils';

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
it('test convertSecondsToMinutes method', () => {
  expect(convertSecondsToMinutes(0)).toBe('0 minutes');
  expect(convertSecondsToMinutes(60)).toBe('1 minute');
  expect(convertSecondsToMinutes(120)).toBe('2 minutes');
  expect(convertSecondsToMinutes(65)).toBe('1 minute and 5 seconds');
  expect(convertSecondsToMinutes(1)).toBe('1 second');
  expect(convertSecondsToMinutes(59)).toBe('59 seconds');
});

it('test filterAlertsByStatusAndType method', () => {
  const alerts = alertFactory.buildList(12, { created_by: 'system' });
  expect(filterAlertsByStatusAndType(alerts, '', 'system')).toHaveLength(12);
  expect(filterAlertsByStatusAndType(alerts, '', 'user')).toHaveLength(0);
  expect(filterAlertsByStatusAndType(alerts, 'Alert-1', 'system')).toHaveLength(
    4
  );
});
it('test convertAlertsToTypeSet method', () => {
  const alerts = alertFactory.buildList(12, { created_by: 'user' });

  expect(convertAlertsToTypeSet(alerts)).toHaveLength(1);
});
