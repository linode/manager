import { extendedTypes } from 'src/__data__/ExtendedType';
import { typeFactory } from 'src/factories/types';

import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTypeOrder,
} from './utils';

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
    const selectedID = 'g6-standard-6';

    const initialTab = determineInitialPlanCategoryTab(types, selectedID);

    expect(initialTab).toBe(1);
  });

  it('should return the correct initial tab when nanode plan is selected', () => {
    const selectedID = 'g6-nanode-1';

    const initialTab = determineInitialPlanCategoryTab(types, selectedID);

    expect(initialTab).toBe(1);
  });

  it('should return the correct initial tab when highmem plan is selected', () => {
    const selectedID = 'g7-highmem-8';

    const initialTab = determineInitialPlanCategoryTab(types, selectedID);

    expect(initialTab).toBe(2);
  });
  it('should return the correct initial tab when gpu plan is selected', () => {
    const selectedID = 'g1-gpu-rtx6000-2';

    const initialTab = determineInitialPlanCategoryTab(types, selectedID);

    expect(initialTab).toBe(3);
  });
});
