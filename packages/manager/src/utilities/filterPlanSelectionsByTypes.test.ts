import { getPlanSelectionsByPlanType } from './filterPlanSelectionsByType';
import { extendedTypes } from 'src/__data__/ExtendedType';

describe('getPlanSelectionsByPlanType', () => {
  it('returns an object with plans grouped by type', () => {
    const highmemPlans = extendedTypes.filter(
      (type) => type.class === 'highmem'
    );
    const nanodePlans = extendedTypes.filter((type) => type.class === 'nanode');
    const standardPlans = extendedTypes.filter(
      (type) => type.class === 'standard'
    );
    const { nanode, highmem, standard } = getPlanSelectionsByPlanType(
      extendedTypes
    );

    expect(highmem).toEqual(highmemPlans);
    expect(standard).toEqual(standardPlans);
    expect(nanode).toEqual(nanodePlans);
  });
});
