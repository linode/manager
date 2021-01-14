import { getPercentage } from './BarPercent';

describe('BarPercent', () => {
  it('getPercentage() should correctly return a percentage of max value ', () => {
    expect(getPercentage(50, 100)).toBe(50);
    expect(getPercentage(0, 100)).toBe(0);
    expect(getPercentage(2150, 10000)).toBe(21.5);
  });
});
