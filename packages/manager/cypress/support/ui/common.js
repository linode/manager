const attempt = (fn, attemptsRemaining, delayBetweenAttemptsMs) => {
  if (attemptsRemaining <= 1) {
    return fn(); // last attempt
  }
  try {
    return fn();
  } catch (err) {
    cy.wait(delayBetweenAttemptsMs);
    return attempt(fn, attemptsRemaining - 1, delayBetweenAttemptsMs);
  }
};

/// Wraps an Action of type ()=>void to make ot more stable
/// Tries Multiple Time, wiats before, and between attempts
export const defensiveDo = (
  getFunction,
  attemptsNumber = 3,
  waitBeforeTryMs = 200,
  delayBetweenAttemptsMs = 200
) => {
  cy.wait(waitBeforeTryMs);
  attempt(getFunction, attemptsNumber, delayBetweenAttemptsMs);
};
