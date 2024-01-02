import { extendedTypes } from 'src/__data__/ExtendedType';
import { planSelectionTypeFactory, typeFactory } from 'src/factories/types';

import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  getPlanSoldOutStatus,
  planTypeOrder,
} from './utils';

import type { PlanSelectionType } from './types';

const standard = typeFactory.build({ class: 'standard', id: 'g6-standard-1' });
const metal = typeFactory.build({ class: 'metal', id: 'g6-metal-alpha-2' });
const dedicated = typeFactory.build({
  class: 'dedicated',
  id: 'g6-dedicated-2',
});
const prodedicated = typeFactory.build({
  class: 'prodedicated',
  id: 'g6-prodedicated-alpha-2',
});
const nanode = typeFactory.build({ class: 'nanode', id: 'g6-nanode-1' });
const premium = typeFactory.build({ class: 'premium', id: 'g6-premium-2' });
const highmem = typeFactory.build({ class: 'highmem', id: 'g6-highmem-1' });
const gpu = typeFactory.build({ class: 'gpu', id: 'g6-gpu-1' });

describe('getPlanSelectionsByPlanType', () => {
  it('should return an object with plans grouped by type', () => {
    const actual = getPlanSelectionsByPlanType([
      premium,
      metal,
      gpu,
      highmem,
      standard,
      nanode,
      dedicated,
      prodedicated,
    ]);
    expect([standard, nanode]).toEqual(actual.shared);
    expect([metal]).toEqual(actual.metal);
    expect([premium]).toEqual(actual.premium);
    expect([dedicated]).toEqual(actual.dedicated);
    expect([gpu]).toEqual(actual.gpu);
    expect([highmem]).toEqual(actual.highmem);
    expect([prodedicated]).toEqual(actual.prodedicated);
  });
  it('should return grouped plans in the correct order', () => {
    const actual = getPlanSelectionsByPlanType([
      premium,
      metal,
      gpu,
      highmem,
      standard,
      nanode,
      dedicated,
      prodedicated,
    ]);
    const expectedOrder = planTypeOrder;

    const actualKeys = Object.keys(actual);

    expect(actualKeys).toEqual(expectedOrder);
  });
  it('case:1 -> should return grouped plans in the correct order after filtering empty plans', () => {
    const actual = getPlanSelectionsByPlanType([
      metal,
      gpu,
      nanode,
      highmem,
      standard,
      dedicated,
    ]);
    const expectedOrder = planTypeOrder.slice(1, 6);
    const actualKeys = Object.keys(actual);

    expect(actualKeys).toEqual(expectedOrder);
  });
  it('case:2 -> should return grouped plans in the correct order after filtering empty plans', () => {
    const actual = getPlanSelectionsByPlanType([
      premium,
      nanode,
      gpu,
      standard,
    ]);
    const expectedOrder = [
      planTypeOrder[2],
      planTypeOrder[4],
      planTypeOrder[6],
    ];

    const actualKeys = Object.keys(actual);

    expect(actualKeys).toEqual(expectedOrder);
  });
  it('case:3 -> should return grouped plans in the correct order after filtering empty plans', () => {
    const actual = getPlanSelectionsByPlanType([premium]);
    const expectedOrder = [planTypeOrder[6]];

    const actualKeys = Object.keys(actual);

    expect(actualKeys).toEqual(expectedOrder);
  });
});

describe('determineInitialPlanCategoryTab', () => {
  const types = extendedTypes;

  it('should return default plan as dedicated', () => {
    const initialTab = determineInitialPlanCategoryTab(types);

    expect(initialTab).toBe(0);
  });

  it('should return the correct initial tab when dedicated plan is selected', () => {
    const selectedId = 'g6-standard-6';

    const initialTab = determineInitialPlanCategoryTab(types, selectedId);

    expect(initialTab).toBe(1);
  });

  it('should return the correct initial tab when nanode plan is selected', () => {
    const selectedId = 'g6-nanode-1';

    const initialTab = determineInitialPlanCategoryTab(types, selectedId);

    expect(initialTab).toBe(1);
  });

  it('should return the correct initial tab when highmem plan is selected', () => {
    const selectedId = 'g7-highmem-8';

    const initialTab = determineInitialPlanCategoryTab(types, selectedId);

    expect(initialTab).toBe(2);
  });

  it('should return the correct initial tab when gpu plan is selected', () => {
    const selectedId = 'g1-gpu-rtx6000-2';

    const initialTab = determineInitialPlanCategoryTab(types, selectedId);

    expect(initialTab).toBe(3);
  });
});

describe('getPlanSoldOutStatus', () => {
  const mockPlan: PlanSelectionType = planSelectionTypeFactory.build();
  const mockSelectedRegionId = 'us-east-1';

  it('should return false if regionAvailabilities is falsy', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: undefined,
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return false if no matching regionAvailability is found (based on planId)', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: [
        { available: true, plan: 'fakeplan', region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return false if selectedRegionId is falsy', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: undefined,
    });

    expect(result).toBe(false);
  });

  it('should return false if no matching regionAvailability is found', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-west-2' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return true if matching regionAvailability is found with available set to false', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(true);
  });

  it('should return false if matching regionAvailability is found with available set to true', () => {
    const result = getPlanSoldOutStatus({
      plan: mockPlan,
      regionAvailabilities: [
        { available: true, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });
});
