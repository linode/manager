import { isMuchTraffic } from './TablesPanel';

describe('TablesPanel', () => {
  describe('isMuchTraffic', () => {
    it('should return true if any stat is >= 1GB', () => {
      const traffic: [number, number][] = [
        [0, 1],
        [0, 1073741824],
        [0, 3],
      ];

      expect(isMuchTraffic(traffic)).toBeTruthy();
    });
    it('should return false if no stat is >= 1GB', () => {
      const traffic: [number, number][] = [
        [0, 1],
        [0, 2],
        [0, 3],
      ];

      expect(isMuchTraffic(traffic)).toBeFalsy();
    });
  });
});
