import { cleanCVV } from './billingUtils';

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
});
