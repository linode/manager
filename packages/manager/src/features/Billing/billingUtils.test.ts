import { cleanCVV, renderUnitPrice } from './billingUtils';

describe('Billing helper methods', () => {
  describe('cleanCVV function', () => {
    it('should return a valid CVV unchanged', () => {
      expect(cleanCVV('123')).toBe('123');
      expect(cleanCVV('1234')).toBe('1234');
    });

    it('should clamp CVVs at four characters', () => {
      expect(cleanCVV('1234567')).toBe('1234');
    });

    it('should strip out non-numeric input', () => {
      expect(cleanCVV('abc1')).toBe('1');
    });
  });

  describe('renderUnitPrice function', () => {
    it('should return null if the value can not be parsed into a Number', () => {
      expect(renderUnitPrice('three')).toBeNull();
      expect(renderUnitPrice('None')).toBeNull();
      expect(renderUnitPrice(null)).toBeNull();
    });

    it('should return the formatted value if the value can be parsed into a Number', () => {
      expect(renderUnitPrice('0')).toBe('$0');
      expect(renderUnitPrice('0.015')).toBe('$0.015');
    });
  });
});
