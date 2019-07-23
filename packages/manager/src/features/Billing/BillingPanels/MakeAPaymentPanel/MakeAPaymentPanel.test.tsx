import {
  getDefaultPayment,
  isAllowedUSDAmount,
  shouldEnablePaypalButton
} from './MakeAPaymentPanel';

describe('Make a Payment Panel', () => {
  it('should return false for invalid USD amount', () => {
    expect(isAllowedUSDAmount(0)).toBeFalsy();
    expect(isAllowedUSDAmount(501)).toBeFalsy();
  });

  it('should return true for valid USD amount', () => {
    expect(isAllowedUSDAmount(5)).toBeTruthy();
    expect(isAllowedUSDAmount(455)).toBeTruthy();
  });

  it('should disable paypal button when invalid USD amount or no input', () => {
    expect(shouldEnablePaypalButton(undefined)).toBeFalsy();
    expect(shouldEnablePaypalButton(1)).toBeFalsy();
    expect(shouldEnablePaypalButton(501)).toBeFalsy();
  });

  it('should enable paypal button when valid USD amount', () => {
    expect(shouldEnablePaypalButton(500)).toBeTruthy();
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
});
