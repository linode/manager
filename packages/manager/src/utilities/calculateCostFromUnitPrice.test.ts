import calculateCostFromUnitPrice from './calculateCostFromUnitPrice';

describe('unitPriceCalculator', () => {
  it('should return a string of $0.00 if given a negative number for the unit price', () => {
    expect(calculateCostFromUnitPrice(-1, 200)).toBe('$0.00');
  });

  it('should return a string of $0.00 if given a negative number for the quantity', () => {
    expect(calculateCostFromUnitPrice(1, -200)).toBe('$0.00');
  });

  it('should return a string starting with a $ sign', () => {
    const result = calculateCostFromUnitPrice(1, 1);
    const firstCharacter = result.charAt(0);
    expect(firstCharacter).toBe('$');
  });

  it('should properly calculate the total price for the given quantity', () => {
    expect(calculateCostFromUnitPrice(2.5, 10.5)).toBe('$26.25');
  });
});
