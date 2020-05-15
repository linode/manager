import {
  getNextCycleEstimatedBalance,
  willPromotionBeApplied
} from './billingUtilities';

describe('getNextCycleEstimatedBalance', () => {
  it('always include balanceUninvoiced in the total', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 0
      })
    ).toBe(10);
  });

  it("only include balance if balance <= 0 (i.e. there's a credit", () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 5
      })
    ).toBe(10);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: -5
      })
    ).toBe(5);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: -20
      })
    ).toBe(-10);
  });

  it('only includes promo if balanceUninvoiced - credit is > 0', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: 0
      })
    ).toBe(5);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: -5
      })
    ).toBe(0);
  });

  it('only applies the promotion to the point where total == 0', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: -5
      })
    ).toBe(0);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: 0
      })
    ).toBe(0);
  });
});

describe('willPromotionBeApplied', () => {
  it('returns TRUE if balanceUninvoiced - credit is > 0', () => {
    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: 0
      })
    ).toBe(true);

    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: -5
      })
    ).toBe(true);

    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 20,
        balance: 0
      })
    ).toBe(true);

    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 20,
        balance: -5
      })
    ).toBe(true);
  });

  it('returns FALSE if balanceUninvoiced - credit <= 0', () => {
    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: -10
      })
    ).toBe(false);

    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: -20
      })
    ).toBe(false);
  });

  it('returns FALSE if there is no promo credit', () => {
    expect(
      willPromotionBeApplied({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 0
      })
    ).toBe(false);
  });
});
