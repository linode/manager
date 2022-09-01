import {
  generateInFilter,
  generateNeqFilter,
  generatePollingFilter,
} from './requestFilters';

describe('requestFilters', () => {
  describe('generateInFilter', () => {
    it('generates a filter from an array of values', () => {
      const result = generateInFilter('id', [1, 2, 3]);
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('generateNeqFilter', () => {
    it('generates +neq filter from key and array of values', () => {
      const result = generateNeqFilter('id', [1, 2, 3]);
      expect(result).toEqual([
        { id: { '+neq': 1 } },
        { id: { '+neq': 2 } },
        { id: { '+neq': 3 } },
      ]);
    });
  });

  describe('generatePollingFilter', () => {
    const timestamp = '2020-01-01T00:00:00';

    it('generates a simple filter when pollIDs is empty', () => {
      const result = generatePollingFilter(timestamp, []);
      expect(result).toEqual({ created: { '+gte': timestamp } });
    });

    it('handles "in" IDs', () => {
      const inIds = [1, 2, 3];
      const result = generatePollingFilter(timestamp, inIds);
      expect(result).toEqual({
        '+or': [
          { created: { '+gte': timestamp } },
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ],
      });
    });

    it('handles "+neq" IDs', () => {
      const result = generatePollingFilter(timestamp, [], [1, 2, 3]);
      expect(result).toEqual({
        '+and': [
          { created: { '+gte': timestamp } },
          { id: { '+neq': 1 } },
          { id: { '+neq': 2 } },
          { id: { '+neq': 3 } },
        ],
      });
    });

    it('handles "in" and "+neq" IDs together', () => {
      const result = generatePollingFilter(timestamp, [1, 2, 3], [4, 5, 6]);
      expect(result).toEqual({
        '+or': [
          {
            '+and': [
              { created: { '+gte': timestamp } },
              { id: { '+neq': 4 } },
              { id: { '+neq': 5 } },
              { id: { '+neq': 6 } },
            ],
          },
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ],
      });
    });
  });
});
