import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
} from './utils';
import { typeFactory } from 'src/factories/types';
import { extendedTypes } from 'src/__data__/ExtendedType';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ id: 'g6-metal-alpha-2', class: 'metal' });

describe('getPlanSelectionsByPlanType', () => {
  it('should return an object with plans grouped by type', () => {
    const actual = getPlanSelectionsByPlanType([standard, metal]);
    expect([standard]).toEqual(actual.shared);
    expect([metal]).toEqual(actual.metal);
  });
  it('should filter empty plan types', () => {
    const actual = getPlanSelectionsByPlanType([standard, metal]);
    expect(actual).toEqual({ shared: [standard], metal: [metal] });
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
