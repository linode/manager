import { getNextCycleEstimatedBalance } from './billingCalculation';

// Should show past due amount

// SUM:
// Should always add uninvoiced total
// If monthly promo remaining:
//   Should show promo IF balance is negative and balance + uninvoiced > 0
// If balance is negative:
//   Should add balance to total

describe('getNextCycleEstimatedBalance', () => {
  it('it should always add uninvoiced charges to the total', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: 0
      })
    ).toBe(10);
  });

  it('should only add balance if balance is negative', () => {
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
  });

  it('returns a negative total if balance is negative and is greater than uninvoiced', () => {
    expect(
      getNextCycleEstimatedBalance({
        balanceUninvoiced: 10,
        promoThisMonthCreditRemaining: 0,
        balance: -20
      })
    ).toBe(-10);
  });

  it('only adds the promo if there is not enough credit (negative balance) to cover uninvoiced', () => {
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

  it('only adds the promo up to the point where the total is 0', () => {
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
