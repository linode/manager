import { regions } from 'src/__data__/regionsData';

import { getRegionOptions, getSelectedRegionById } from './RegionSelect';

const fakeRegion = { ...regions[0], country: 'fake iso code' };
const flags = {};

describe('Region Select helper functions', () => {
  describe('getRegionOptions', () => {
    it('should return a list of items grouped by continent', () => {
      const groupedRegions = getRegionOptions(
        regions,
        flags,
        '/linodes/create'
      );
      const [r1, r2, r3, r4, r5] = groupedRegions;
      expect(groupedRegions).toHaveLength(8);
      expect(r1.options).toHaveLength(5);
      expect(r2.options).toHaveLength(2);
      expect(r3.options).toHaveLength(3);
      expect(r4.options).toHaveLength(0);
      expect(r5.options).toHaveLength(1);
    });

    it('should group unrecognized regions as Other', () => {
      const groupedRegions = getRegionOptions(
        [fakeRegion],
        flags,
        '/linodes/create'
      );
      expect(
        groupedRegions.find((group) => group.label === 'Other')
      ).toBeDefined();
    });
  });

  describe('getSelectedRegionById', () => {
    it('should return the matching Item from a list of GroupedItems', () => {
      const groupedRegions = getRegionOptions(
        regions,
        flags,
        '/linodes/create'
      );
      const selectedID = regions[1].id;
      expect(getSelectedRegionById(selectedID, groupedRegions)).toHaveProperty(
        'value',
        regions[1].id
      );
    });
  });
});
