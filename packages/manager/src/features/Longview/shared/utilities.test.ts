import { Stat } from '../request.types';
import { statAverage, statMax } from './utilities';

const generateStats = (yValues: number[]): Stat[] => {
  return yValues.map(n => ({ x: 0, y: n }));
};

describe('LV utility functions ', () => {
  describe('statAverage', () => {
    it('returns the average', () => {
      let data = generateStats([1, 2, 3]);
      expect(statAverage(data)).toBe(2);
      data = generateStats([1, 1]);
      expect(statAverage(data)).toBe(1);
      data = generateStats([1, 10]);
      expect(statAverage(data)).toBe(5.5);
      data = generateStats([1]);
      expect(statAverage(data)).toBe(1);
    });

    it('handles empty input', () => {
      expect(statAverage()).toBe(0);
    });
  });

  describe('statMax', () => {
    it('returns the max', () => {
      let data = generateStats([1, 2, 3]);
      expect(statMax(data)).toBe(3);
      data = generateStats([1, 1]);
      expect(statMax(data)).toBe(1);
      data = generateStats([10, 1]);
      expect(statMax(data)).toBe(10);
      data = generateStats([1]);
      expect(statMax(data)).toBe(1);
      data = generateStats([-1, 0]);
      expect(statMax(data)).toBe(0);
      data = generateStats([-1, 5]);
      expect(statMax(data)).toBe(5);
    });

    it('handles empty input', () => {
      expect(statMax()).toBe(0);
    });
  });
});
