import { dashboardFactory } from 'src/factories';

import {
  checkIfFilterBuilderNeeded,
  checkMandatoryFiltersSelected,
  constructDimensionFilters,
  getDashboardProperties,
} from './ReusableDashboardFilterUtils';

const mockDashboard = dashboardFactory.build();

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

it('test checkMandatoryFiltersSelected method', () => {
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
    timeDuration: { unit: 'min', value: 30 },
  });

  expect(result).toBe(true);

  // check for dbaas
  result = checkMandatoryFiltersSelected({
    dashboardObj: { ...mockDashboard, service_type: 'dbaas' },
    filterValue: { region: 'us-east' }, // here nodeType is missing
    resource: 1,
    timeDuration: { unit: 'min', value: 30 },
  });

  expect(result).toBe(false);

  result = checkMandatoryFiltersSelected({
    dashboardObj: { ...mockDashboard, service_type: 'dbaas' },
    filterValue: { nodeType: 'primary', region: 'us-east' },
    resource: 1,
    timeDuration: { unit: 'min', value: 30 },
  });

  expect(result).toBe(true);
});

it('test constructDimensionFilters method', () => {
  mockDashboard.service_type = 'dbaas';
  const result = constructDimensionFilters({
    dashboardObj: mockDashboard,
    filterValue: { nodeType: 'primary' },
    resource: 1,
  });

  expect(result.length).toEqual(1);
  expect(result[0].filterKey).toEqual('nodeType');
  expect(result[0].filterValue).toEqual('primary');
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
  expect(result).toBe(true); // should be true for dbaas, as we have the node type filter

  result = checkIfFilterBuilderNeeded({
    ...mockDashboard,
    service_type: '',
  });
  expect(result).toBe(false); // should be false for empty / undefined case
});
