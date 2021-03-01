import { getNextCycleEstimatedBalance } from './billingUtilities';

describe('getNextCycleEstimatedBalance', () => {
  it('always include balanceUninvoiced in the total', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 0,
      })
    ).toBe(10);
  });

  it("only include balance if balance <= 0 (i.e. there's a credit", () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 5,
      })
    ).toBe(10);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: -5,
      })
    ).toBe(5);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: -20,
      })
    ).toBe(-10);
  });

  it('only includes promo if balanceUninvoiced - credit is > 0', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: 0,
      })
    ).toBe(5);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 5,
        balance: -5,
      })
    ).toBe(0);
  });

  it('only applies the promotion to the point where total == 0', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: -5,
      })
    ).toBe(0);

    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 15,
        balance: 0,
      })
    ).toBe(0);
  });
});
