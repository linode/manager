import { getMinimumPayment } from './PaymentDrawer';

import { isAllowedUSDAmount, shouldEnablePaypalButton } from './Paypal';

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

  describe('getMinimumPayment helper method', () => {
    it('should return 5 if the balance due is 0', () => {
      expect(getMinimumPayment(0)).toBe(5);
    });

    it('should return the balance if the balance due is less than $5', () => {
      expect(getMinimumPayment(1.5)).toBe(1.5);
    });

    it('should return 5 if the balance due is less than 0', () => {
      expect(getMinimumPayment(-10.6)).toBe(5);
    });

    it('should return 5 if the balance due is greater than 5', () => {
      expect(getMinimumPayment(100000)).toBe(5);
    });
  });
});
