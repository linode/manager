import { getCustomColor, getPercentage } from './utils';

describe('BarPercent Utils', () => {
  it('getPercentage() should correctly return a percentage of max value ', () => {
    expect(getPercentage(50, 100)).toBe(50);
    expect(getPercentage(0, 100)).toBe(0);
    expect(getPercentage(2150, 10000)).toBe(21.5);
  });

  it('getCustomColor() should correctly return a color based on the percentage', () => {
    expect(getCustomColor([{ color: 'red', percentage: 50 }], 50)).toBe('red');
    expect(getCustomColor([{ color: 'red', percentage: 50 }], 25)).toBe(
      undefined
    );
  });
});
