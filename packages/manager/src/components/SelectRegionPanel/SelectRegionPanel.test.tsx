import { extendedRegions } from 'src/__data__/regionsData';
import { getRegionOptions, getSelectedRegionById } from './SelectRegionPanel';

const fakeRegion = { ...extendedRegions[0], country: 'NZ' };

describe('SelectRegionPanel', () => {
  describe('helper functions', () => {
    describe('getRegionOptions', () => {
      it('should return a list of items grouped by country', () => {
        const groupedRegions = getRegionOptions(extendedRegions);
        const [r1, r2, r3] = groupedRegions;
        expect(groupedRegions).toHaveLength(3);
        expect(r1.options).toHaveLength(5);
        expect(r2.options).toHaveLength(2);
        expect(r3.options).toHaveLength(3);
      });

      it('should group unrecognized regions as Other', () => {
        const groupedRegions = getRegionOptions([fakeRegion]);
        expect(groupedRegions).toHaveLength(1);
        expect(groupedRegions[0]).toHaveProperty('label', 'Other');
      });
    });

    describe('getSelectedRegionById', () => {
      it('should return the matching Item from a list of GroupedItems', () => {
        const groupedRegions = getRegionOptions(extendedRegions);
        const selectedID = extendedRegions[1].id;
        expect(
          getSelectedRegionById(selectedID, groupedRegions)
        ).toHaveProperty('value', extendedRegions[1].id);
      });
    });
  });
});
