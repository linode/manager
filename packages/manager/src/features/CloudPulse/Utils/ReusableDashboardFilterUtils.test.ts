import { DateTime } from 'luxon';

import { dashboardFactory } from 'src/factories';

import {
  checkIfFilterBuilderNeeded,
  checkIfFilterNeededInMetricsCall,
  checkMandatoryFiltersSelected,
  constructDimensionFilters,
  getDashboardProperties,
} from './ReusableDashboardFilterUtils';

const mockDashboard = dashboardFactory.build();
const end = DateTime.now();
const start = end.minus({ minutes: 30 });
const preset = '30minutes';
it('test getDashboardProperties method', () => {
  const result = getDashboardProperties({
    dashboardObj: mockDashboard,
    filterValue: { region: 'us-east' },
    resource: 1,
  });

  expect(result).toBeDefined();
  expect(result.dashboardId).toEqual(mockDashboard.id);
  expect(result.resources).toEqual(['1']);
});

it('test checkMandatoryFiltersSelected method for time duration and resource', () => {
  let result = checkMandatoryFiltersSelected({
    dashboardObj: mockDashboard,
    filterValue: { region: 'us-east' },
    resource: 0,
  });
  expect(result).toBe(false);
  result = checkMandatoryFiltersSelected({
    dashboardObj: mockDashboard,
    filterValue: { region: 'us-east' },
    resource: 1,
    timeDuration: {
      end: end.toISO(),
      preset,
      start: start.toISO(),
    },
  });

  expect(result).toBe(true);

  result = checkMandatoryFiltersSelected({
    dashboardObj: mockDashboard,
    filterValue: { region: 'us-east' },
    resource: 1,
    timeDuration: undefined, // here time duration is undefined, so it should return false
  });

  expect(result).toBe(false);

  result = checkMandatoryFiltersSelected({
    dashboardObj: mockDashboard,
    filterValue: { region: 'us-east' },
    resource: 0, // here resource is 0, so it should return false
    timeDuration: { end: end.toISO(), preset, start: start.toISO() },
  });

  expect(result).toBe(false);
});

it('test checkMandatoryFiltersSelected method for role', () => {
  // check for dbaas
  let result = checkMandatoryFiltersSelected({
    dashboardObj: { ...mockDashboard, service_type: 'dbaas' },
    filterValue: { region: 'us-east' }, // here role is missing
    resource: 1,
    timeDuration: { end: end.toISO(), preset, start: start.toISO() },
  });

  expect(result).toBe(false);

  result = checkMandatoryFiltersSelected({
    dashboardObj: { ...mockDashboard, service_type: 'dbaas' },
    filterValue: { node_type: 'primary', region: 'us-east' },
    resource: 1,
    timeDuration: { end: end.toISO(), preset, start: start.toISO() },
  });

  expect(result).toBe(true);
});

it('test constructDimensionFilters method', () => {
  mockDashboard.service_type = 'dbaas';
  const result = constructDimensionFilters({
    dashboardObj: mockDashboard,
    filterValue: { node_type: 'primary' },
    resource: 1,
  });

  expect(result.length).toEqual(1);
  expect(result[0].filterKey).toEqual('node_type');
  expect(result[0].filterValue).toEqual('primary');
});

it('test checkIfFilterNeededInMetricsCall method', () => {
  let result = checkIfFilterNeededInMetricsCall('region', 'linode');
  expect(result).toEqual(false);

  result = checkIfFilterNeededInMetricsCall('resource_id', 'linode');
  expect(result).toEqual(false); // not needed as dimension filter

  result = checkIfFilterNeededInMetricsCall('node_type', 'dbaas');
  expect(result).toEqual(true);

  result = checkIfFilterNeededInMetricsCall('engine', 'dbaas');
  expect(result).toEqual(false);

  result = checkIfFilterNeededInMetricsCall('node_type', 'xyz'); // xyz service type
  expect(result).toEqual(false);
});

it('test checkIfFilterBuilderNeeded method', () => {
  let result = checkIfFilterBuilderNeeded({
    ...mockDashboard,
    service_type: 'linode',
  });
  expect(result).toBe(false); // should be false for linode

  result = checkIfFilterBuilderNeeded({
    ...mockDashboard,
    service_type: 'dbaas',
  });
  expect(result).toBe(true); // should be true for dbaas, as we have the role filter

  result = checkIfFilterBuilderNeeded({
    ...mockDashboard,
    service_type: '',
  });
  expect(result).toBe(false); // should be false for empty / undefined case

  result = checkIfFilterBuilderNeeded(undefined);

  expect(result).toBe(false); // should be false for empty / undefined dashboard
});
