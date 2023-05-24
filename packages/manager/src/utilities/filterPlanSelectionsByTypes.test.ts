import { getPlanSelectionsByPlanType } from './filterPlanSelectionsByType';
import { typeFactory } from 'src/factories/types';

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
