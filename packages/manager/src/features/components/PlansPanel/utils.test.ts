import { renderHook } from '@testing-library/react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { regionAvailabilityFactory } from 'src/factories';
import { planSelectionTypeFactory, typeFactory } from 'src/factories/types';

import { PLAN_IS_CURRENTLY_UNAVAILABLE_COPY } from './constants';
import {
  determineInitialPlanCategoryTab,
  extractPlansInformation,
  getDisabledPlanReasonCopy,
  getIsLimitedAvailability,
  getPlanSelectionsByPlanType,
  planTypeOrder,
  replaceOrAppendPlaceholder512GbPlans,
  useIsAcceleratedPlansEnabled,
} from './utils';

import type { PlanSelectionType } from './types';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', () => {
  const actual = vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

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
const accelerated = typeFactory.build({
  class: 'accelerated',
  id: 'accelerated-1',
});

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
      accelerated,
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

  it('should filter out RTX6000 plans when isLKE is true', () => {
    const rtx6000Plan = typeFactory.build({
      class: 'gpu',
      id: 'g1-gpu-rtx6000-1',
    });
    const rtx4000Plan = typeFactory.build({
      class: 'gpu',
      id: 'g1-gpu-rtx4000-1',
    });

    // With isLKE: true, RTX6000 should be filtered out
    const actualWithLKE = getPlanSelectionsByPlanType(
      [rtx6000Plan, rtx4000Plan],
      { isLKE: true }
    );

    // With isLKE: false or default, RTX6000 should remain
    const actualWithoutLKE = getPlanSelectionsByPlanType(
      [rtx6000Plan, rtx4000Plan],
      { isLKE: false }
    );

    const actualWithDefault = getPlanSelectionsByPlanType([
      rtx6000Plan,
      rtx4000Plan,
    ]);

    // RTX6000 should be filtered out in LKE context
    expect(actualWithLKE.gpu).toEqual([rtx4000Plan]);

    // RTX6000 should remain in non-LKE context
    expect(actualWithoutLKE.gpu).toEqual([rtx6000Plan, rtx4000Plan]);
    expect(actualWithDefault.gpu).toEqual([rtx6000Plan, rtx4000Plan]);
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

describe('getIsLimitedAvailability', () => {
  const mockPlan: PlanSelectionType = planSelectionTypeFactory.build();
  const mockSelectedRegionId = 'us-east-1';

  it('should return false if regionAvailabilities is falsy', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: undefined,
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return false if no matching regionAvailability is found (based on planId)', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: [
        { available: true, plan: 'fakeplan', region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return false if selectedRegionId is falsy', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: undefined,
    });

    expect(result).toBe(false);
  });

  it('should return false if no matching regionAvailability is found', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-west-2' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });

  it('should return true if matching regionAvailability is found with available set to false', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: [
        { available: false, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(true);
  });

  it('should return false if matching regionAvailability is found with available set to true', () => {
    const result = getIsLimitedAvailability({
      plan: mockPlan,
      regionAvailabilities: [
        { available: true, plan: mockPlan.id, region: 'us-east-1' },
      ],
      selectedRegionId: mockSelectedRegionId,
    });

    expect(result).toBe(false);
  });
});

describe('extractPlansInformation', () => {
  const g6Standard1 = planSelectionTypeFactory.build({
    id: 'g6-standard-1',
  });
  const g7Standard1 = planSelectionTypeFactory.build({
    id: 'g7-standard-1',
  });
  const g6Nanode1 = planSelectionTypeFactory.build({
    id: 'g6-nanode-1',
  });
  it('should return correct information when less than half of plans are disabled', () => {
    const result = extractPlansInformation({
      disableLargestGbPlansFlag: false,
      plans: [g6Standard1, g7Standard1, g6Nanode1],
      regionAvailabilities: [
        regionAvailabilityFactory.build({
          available: false,
          plan: 'g6-standard-1',
          region: 'us-east',
        }),
      ],
      selectedRegionId: 'us-east',
    });

    expect(result).toHaveProperty('allDisabledPlans', [
      {
        ...g6Standard1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: true,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmallForAPL: undefined,
        },
      },
    ]);
    expect(result).toHaveProperty('hasDisabledPlans', true);
    expect(result).toHaveProperty('hasMajorityOfPlansDisabled', false);
    expect(result).toHaveProperty('plansForThisLinodeTypeClass', [
      {
        ...g6Standard1,
        planBelongsToDisabledClass: false,
        planHasLimitedAvailability: true,
        planIsDisabled512Gb: false,
        planIsSmallerThanUsage: false,
        planIsTooSmallForAPL: undefined,
      },
      {
        ...g7Standard1,
        planBelongsToDisabledClass: false,
        planHasLimitedAvailability: false,
        planIsDisabled512Gb: false,
        planIsSmallerThanUsage: false,
        planIsTooSmallForAPL: undefined,
      },
      {
        ...g6Nanode1,
        planBelongsToDisabledClass: false,
        planHasLimitedAvailability: false,
        planIsDisabled512Gb: false,
        planIsSmallerThanUsage: false,
        planIsTooSmallForAPL: undefined,
      },
    ]);
  });

  it('should return correct information when all plans are disabled', () => {
    const result = extractPlansInformation({
      disableLargestGbPlansFlag: false,
      disabledSmallerPlans: [g7Standard1],
      isLegacyDatabase: true,
      plans: [g6Standard1, g6Nanode1, g7Standard1],
      regionAvailabilities: [
        regionAvailabilityFactory.build({
          available: false,
          plan: 'g6-standard-1',
          region: 'us-east',
        }),
        regionAvailabilityFactory.build({
          available: false,
          plan: 'g6-nanode-1',
          region: 'us-east',
        }),
        regionAvailabilityFactory.build({
          available: true,
          plan: 'g7-standard-1',
          region: 'us-east',
        }),
      ],
      selectedRegionId: 'us-east',
    });

    expect(result).toHaveProperty('allDisabledPlans', [
      {
        ...g6Standard1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: true,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: false,
          planIsTooSmallForAPL: undefined,
        },
      },
      {
        ...g6Nanode1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: true,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: false,
          planIsTooSmallForAPL: undefined,
        },
      },
      {
        ...g7Standard1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: false,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: true,
          planIsTooSmallForAPL: undefined,
        },
      },
    ]);
    expect(result).toHaveProperty('hasDisabledPlans', true);
    expect(result).toHaveProperty('hasMajorityOfPlansDisabled', true);
    expect(result).toHaveProperty('plansForThisLinodeTypeClass', [
      {
        ...g6Standard1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: true,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: false,
          planIsTooSmallForAPL: undefined,
        },
      },
      {
        ...g6Nanode1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: true,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: false,
          planIsTooSmallForAPL: undefined,
        },
      },
      {
        ...g7Standard1,
        ...{
          planBelongsToDisabledClass: false,
          planHasLimitedAvailability: false,
          planIsDisabled512Gb: false,
          planIsSmallerThanUsage: false,
          planIsTooSmall: true,
          planIsTooSmallForAPL: undefined,
        },
      },
    ]);
  });

  it('should return correct information when no plans are disabled', () => {
    const result = extractPlansInformation({
      disableLargestGbPlansFlag: false,
      disabledSmallerPlans: [],
      plans: [g6Standard1, g6Nanode1],
      regionAvailabilities: [
        regionAvailabilityFactory.build({
          available: true,
          plan: 'g6-standard-1',
          region: 'us-east',
        }),
        regionAvailabilityFactory.build({
          available: true,
          plan: 'g6-nanode-1',
          region: 'us-east',
        }),
      ],
      selectedRegionId: 'us-east',
    });

    expect(result).toHaveProperty('allDisabledPlans', []);
    expect(result).toHaveProperty('hasDisabledPlans', false);
    expect(result).toHaveProperty('hasMajorityOfPlansDisabled', false);
    expect(result).toHaveProperty('plansForThisLinodeTypeClass', [
      {
        ...g6Standard1,
        planBelongsToDisabledClass: false,
        planHasLimitedAvailability: false,
        planIsDisabled512Gb: false,
        planIsSmallerThanUsage: false,
        planIsTooSmall: false,
        planIsTooSmallForAPL: undefined,
      },
      {
        ...g6Nanode1,
        planBelongsToDisabledClass: false,
        planHasLimitedAvailability: false,
        planIsDisabled512Gb: false,
        planIsSmallerThanUsage: false,
        planIsTooSmall: false,
        planIsTooSmallForAPL: undefined,
      },
    ]);
  });

  describe('getDisabledPlanReasonCopy', () => {
    it('should always return the default copy', () => {
      const result = getDisabledPlanReasonCopy({} as any);

      expect(result).toBe(PLAN_IS_CURRENTLY_UNAVAILABLE_COPY);
    });
  });

  describe('replaceOrAppendPlaceholder512GbPlans', () => {
    it('should not append to DBaaS plans', () => {
      const plans = [
        {
          id: 'g6-dedicated-56',
          label: 'DBaaS - Dedicated 256GB',
        },
      ] as PlanSelectionType[];
      const results = replaceOrAppendPlaceholder512GbPlans(plans);
      expect(results.length).toEqual(1);
    });

    it('should append to Linode plans', () => {
      const plans = [
        {
          id: 'g6-dedicated-56',
          label: 'Dedicated 256GB',
        },
      ] as PlanSelectionType[];
      const results = replaceOrAppendPlaceholder512GbPlans(plans);
      expect(results.length).toEqual(3);
    });

    it('should replace the Linode plan', () => {
      const plans = [
        {
          id: 'not-the-right-id',
          label: 'Premium 512GB',
        },
      ] as PlanSelectionType[];
      const results = replaceOrAppendPlaceholder512GbPlans(plans);
      expect(results[0].id).toEqual('g7-premium-64');
    });
  });
});

describe('useIsAcceleratedPlansEnabled', () => {
  it('should return false for linode and lke plans: account capability DNE and feature flag false', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: [],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      acceleratedPlans: {
        linodePlans: false,
        lkePlans: false,
      },
    });

    const { result } = renderHook(() => useIsAcceleratedPlansEnabled());
    expect(result.current).toStrictEqual({
      isAcceleratedLKEPlansEnabled: false,
      isAcceleratedLinodePlansEnabled: false,
    });
  });

  it('should return false for linode and lke plans: account capability DNE and feature flag true', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: [],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      acceleratedPlans: {
        linodePlans: true,
        lkePlans: true,
      },
    });

    const { result } = renderHook(() => useIsAcceleratedPlansEnabled());
    expect(result.current).toStrictEqual({
      isAcceleratedLKEPlansEnabled: false,
      isAcceleratedLinodePlansEnabled: false,
    });
  });

  it('should return false for linode and lke plans: account capability exists and feature flag false', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NETINT Quadra T1U'],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      acceleratedPlans: {
        linodePlans: false,
        lkePlans: false,
      },
    });

    const { result } = renderHook(() => useIsAcceleratedPlansEnabled());
    expect(result.current).toStrictEqual({
      isAcceleratedLKEPlansEnabled: false,
      isAcceleratedLinodePlansEnabled: false,
    });
  });

  it('should return true for linode and lke plans', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NETINT Quadra T1U'],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      acceleratedPlans: {
        linodePlans: true,
        lkePlans: true,
      },
    });

    const { result } = renderHook(() => useIsAcceleratedPlansEnabled());
    expect(result.current).toStrictEqual({
      isAcceleratedLKEPlansEnabled: true,
      isAcceleratedLinodePlansEnabled: true,
    });
  });

  // just adding this test since I matched the feature flag values in all previous tests
  it('linodePlans and lkePlans status can have different values depending on the feature flag', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NETINT Quadra T1U'],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      acceleratedPlans: {
        linodePlans: true,
        lkePlans: false,
      },
    });

    const { result } = renderHook(() => useIsAcceleratedPlansEnabled());
    expect(result.current).toStrictEqual({
      isAcceleratedLKEPlansEnabled: false,
      isAcceleratedLinodePlansEnabled: true,
    });
  });
});
