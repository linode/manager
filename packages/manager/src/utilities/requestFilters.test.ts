import { generateInFilter, generatePollingFilter } from './requestFilters';

describe('requestFilters', () => {
  describe('generateInFilter', () => {
    it('generates a filter from an array of values', () => {
      const res = generateInFilter('id', [12, 21, 32]);
      expect(res).toEqual({
        '+or': [{ id: 12 }, { id: 21 }, { id: 32 }]
      });
    });
  });

  describe('generatePollingFilter', () => {
    it('generates a simple filter when pollIDs is empty', () => {
      const res = generatePollingFilter('1970-01-01T00:00:00', []);
      expect(res).toEqual({ created: { '+gt': '1970-01-01T00:00:00' } });
    });
  });
});
