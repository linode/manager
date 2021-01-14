const attempt = (fn, attemptsRemaining, delayBetweenAttemptsMs) => {
  cy.log(`Attempts remaining: ${attemptsRemaining}`);
  if (attemptsRemaining <= 1) {
    return fn(); // last attempt
  }
  try {
    return fn();
  } catch (err) {
    // wait purpusefully here
    /* eslint-disable-next-line cypress/no-unnecessary-waiting*/
    cy.wait(delayBetweenAttemptsMs);
    return attempt(fn, attemptsRemaining - 1, delayBetweenAttemptsMs);
  }
};

// / Wraps an Action of type ()=>void to make ot more stable
// / Tries Multiple Time, wiats before, and between attempts
export const defensiveDo = (
  getFunction,
  attemptsNumber = 5,
  waitBeforeTryMs = 300,
  delayBetweenAttemptsMs = 300
) => {
  // wait purpusefully here
  /* eslint-disable-next-line cypress/no-unnecessary-waiting*/
  cy.wait(waitBeforeTryMs);
  attempt(getFunction, attemptsNumber, delayBetweenAttemptsMs);
};

export const waitForAppLoad = (path = '/', withLogin = true) => {
  cy.intercept('GET', '*/linode/instances/*').as('getLinodes');
  cy.intercept('GET', '*/account').as('getAccount');
  cy.intercept('GET', '*/profile').as('getProfile');
  cy.intercept('GET', '*/account/settings').as('getAccountSettings');
  cy.intercept('GET', '*/profile/preferences').as('getProfilePreferences');
  cy.intercept('GET', '*/account/notifications**').as('getNotifications');

  withLogin ? cy.visitWithLogin(path) : cy.visit(path);
  cy.wait('@getLinodes');
  cy.wait('@getAccount');
  cy.wait('@getAccountSettings');
  cy.wait('@getProfilePreferences');
  cy.wait('@getProfile');
  cy.wait('@getNotifications');
};
