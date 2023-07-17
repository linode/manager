import {
  AKAMAI_DATE,
  PAYMENT_HARD_MAX,
  PAYMENT_MIN,
  PAYMENT_SOFT_MAX,
} from 'src/constants';

import {
  cleanCVV,
  getPaymentLimits,
  getShouldUseAkamaiBilling,
  renderUnitPrice,
} from './billingUtils';

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

  describe('getShouldUseAkamaiBilling', () => {
    it(`should return true if date is past ${AKAMAI_DATE}`, () => {
      expect(getShouldUseAkamaiBilling('2022-12-16T18:04:01')).toBe(true);
    });

    it(`should return false if date is before ${AKAMAI_DATE}`, () => {
      expect(getShouldUseAkamaiBilling('2022-12-01T18:04:01')).toBe(false);
    });
  });

  describe('getPaymentLimits', () => {
    describe('max', () => {
      it(`If account is not loaded (balance is undefined), payment max should be ${PAYMENT_HARD_MAX}`, () => {
        expect(getPaymentLimits(undefined).max).toBe(PAYMENT_HARD_MAX);
      });
      it(`If account has credit, the per payment limit is $${PAYMENT_SOFT_MAX}`, () => {
        expect(getPaymentLimits(-50).max).toBe(PAYMENT_SOFT_MAX);
      });
      it(`For balance due of under $${PAYMENT_SOFT_MAX}, the per payment limit is $${PAYMENT_SOFT_MAX}`, () => {
        expect(getPaymentLimits(PAYMENT_SOFT_MAX - 0.01).max).toBe(
          PAYMENT_SOFT_MAX
        );
      });
      it(`For balance due of over $${PAYMENT_SOFT_MAX} but under the hard max of $${PAYMENT_HARD_MAX}, the user may pay up to $${PAYMENT_HARD_MAX}`, () => {
        expect(getPaymentLimits(PAYMENT_SOFT_MAX + 0.01).max).toBe(
          PAYMENT_HARD_MAX
        );
      });
    });

    describe('min', () => {
      it(`If account is not loaded (balance is undefined), minimum payment should be ${PAYMENT_MIN}`, () => {
        expect(getPaymentLimits(undefined).min).toBe(PAYMENT_MIN);
      });
      it(`If the account balance is $0 (or if there's a positive credit on the account), the minimum payment is $${PAYMENT_MIN}.`, () => {
        expect(getPaymentLimits(-50).min).toBe(5);
        expect(getPaymentLimits(0).min).toBe(5);
      });
      it(`If the account has a past due balance less than $${PAYMENT_MIN}, the minimum payment equals the customer's past due balance.`, () => {
        expect(getPaymentLimits(PAYMENT_MIN - 0.01).min).toBe(
          PAYMENT_MIN - 0.01
        );
      });
      it(`If the account has a past due balance of greater than $${PAYMENT_MIN}, the minimum payment is $${PAYMENT_MIN}`, () => {
        expect(getPaymentLimits(10).min).toBe(5);
      });
    });
  });
});
