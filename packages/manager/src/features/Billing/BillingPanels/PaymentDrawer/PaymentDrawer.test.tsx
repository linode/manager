import {
  getDefaultPayment,
  getMinimumPayment,
  isAllowedUSDAmount,
  shouldEnablePaypalButton
} from './PaymentDrawer';

describe('Make a Payment Panel', () => {
  it('should return false for invalid USD amount', () => {
    expect(isAllowedUSDAmount(0)).toBeFalsy();
    expect(isAllowedUSDAmount(10001)).toBeFalsy();
  });

  it('should return true for valid USD amount', () => {
    expect(isAllowedUSDAmount(5)).toBeTruthy();
    expect(isAllowedUSDAmount(4585)).toBeTruthy();
  });

  it('should disable paypal button when invalid USD amount or no input', () => {
    expect(shouldEnablePaypalButton(undefined)).toBeFalsy();
    expect(shouldEnablePaypalButton(1)).toBeFalsy();
    expect(shouldEnablePaypalButton(10001)).toBeFalsy();
  });

  it('should enable paypal button when valid USD amount', () => {
    expect(shouldEnablePaypalButton(10000)).toBeTruthy();
    expect(shouldEnablePaypalButton(15)).toBeTruthy();
    expect(shouldEnablePaypalButton(5)).toBeTruthy();
  });

  describe('getDefaultPayment helper function', () => {
    it('should return an empty string if balance is false', () => {
      expect(getDefaultPayment(false)).toEqual('');
    });

    it('should return an empty string if the balance is below $5', () => {
      expect(getDefaultPayment(3.0)).toEqual('');
    });

    it('should return a formatted string if the balance is above $5', () => {
      expect(getDefaultPayment(6.1)).toEqual('6.10');
    });
  });

  describe('getMinimumPayment helper method', () => {
    it('should return 5 if the balance due is 0', () => {
      expect(getMinimumPayment(0, 'CREDIT_CARD')).toBe(5);
    });

    it('should return the balance if the balance due is less than $5', () => {
      expect(getMinimumPayment(1.5, 'CREDIT_CARD')).toBe(1.5);
    });

    it('should return 5 if the user is making a PayPal payment', () => {
      expect(getMinimumPayment(2, 'PAYPAL')).toBe(5);
    });

    it('should return 5 if the balance due is less than 0', () => {
      expect(getMinimumPayment(-10.6, 'CREDIT_CARD')).toBe(5);
    });

    it('should return 5 if the balance due is greater than 5', () => {
      expect(getMinimumPayment(100000, 'CREDIT_CARD')).toBe(5);
    });
  });
});
