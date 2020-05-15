/**
 * Calculate the next cycle's balance, given:
 *   1. The current balance
 *   2. The current uninvoiced balance
 *   3. The remaining credit from an active promo (if any)
 *
 * ==== BALANCE ====
 * This is your account's balance. It can be:
 *   - positive (which represents money you CURRENTLY owe Linode)
 *   - negative (which represents a CREDIT on your account that will be applied next cycle)
 *   - zero
 * If BALANCE is positive, it is displayed as PAST DUE. It is NOT applied to the estimate of the
 * next cycle, since it should be paid immediately. If the credit card on file is successfully
 * (automatically) charged, BALANCE will never be positive.
 *
 * ==== UNINVOICED BALANCE ====
 * This is an estimate of the current cycle's invoice total. It will increase as the month goes on.
 * It is the amount you would owe (not including BALANCE) if you cancelled your account right now.
 * Bandwidth charges are not included in this estimate.
 *
 * ==== PROMO THIS MONTH CREDIT REMAINING ====
 * If your account has an active promotion, this is the amount available this month.
 *
 * TO CALCULATE NEXT CYCLE'S BALANCE:
 *
 *   1. Start with total = balanceUninvoiced.
 *   2. If there is a credit (i.e. negative balance), add balance to total.
 *   3. If total <= 0 no promotion will be applied, so RETURN total.
 *   4. ELSE apply promoThisMonthCreditRemaining until total = 0.
 *   5. RETURN total.
 *
 * EXAMPLE A
 * (balance = 0, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 0)
 * total = 10
 *
 * EXAMPLE B
 * (balance = 5, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 0)
 * total = 10
 *
 * EXAMPLE C
 * (balance = -5, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 0)
 * total = 5
 *
 * EXAMPLE D
 * (balance = -20, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 0)
 * total = -10
 *
 * EXAMPLE E
 * (balance = 0, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 5)
 * total = 5
 *
 * EXAMPLE F
 * (balance = -5, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 5)
 * total = 0
 *
 * EXAMPLE G
 * (balance = -5, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 15)
 * total = 0
 *
 * EXAMPLE H
 * (balance = 0, balanceUninvoiced = 10, promoThisMonthCreditRemaining = 15)
 * total = 0
 */
export const getNextCycleEstimatedBalance = (values: NextCycleArguments) => {
  const { balance, balanceUninvoiced, promoThisMonthCreditRemaining } = values;

  // Steps 1-2
  // Start with total = balanceUninvoiced.
  // If there is a credit (i.e. negative balance), add balance to total.
  let total = getSubtotal(balance, balanceUninvoiced);

  // Step 3
  // IF total <= 0 no promotion will be applied, so RETURN total.
  if (total <= 0 || !promoThisMonthCreditRemaining) {
    return total;
  }

  // Step 4
  // ELSE apply promoThisMonthCreditRemaining until total = 0.
  total = Math.max(total - promoThisMonthCreditRemaining, 0);

  // Step 5
  // RETURN total
  return total;
};

/**
 * The subtotal is balanceUninvoiced + balance, if balance is negative (i.e. a credit).
 */
export const getSubtotal = (balance: number, balanceUninvoiced: number) => {
  // Step 1
  // Start with total = balanceUninvoiced.
  let total = balanceUninvoiced;

  // Step 2
  // If there is a credit (i.e. negative balance), add balance to total.
  if (balance < 0) {
    total += balance;
  }

  return total;
};

interface NextCycleArguments {
  // Corresponds to `/account .balance_uninvoiced`
  balanceUninvoiced: number;
  // Corresponds to `/account .promotion[0].this_month_credit_remaining`
  promoThisMonthCreditRemaining?: number;
  // Corresponds to `/account .balance`
  balance: number;
}
