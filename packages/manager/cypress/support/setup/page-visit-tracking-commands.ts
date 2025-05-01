import { randomNumber } from 'support/util/random';

/**
 * Assigns a random page visit ID to the current page.
 *
 * Used to determine whether navigation has occurred later.
 *
 * @returns Cypress chainable that yields the random page visit ID.
 */
Cypress.Commands.add('trackPageVisit', { prevSubject: false }, () => {
  const pageLoadId = randomNumber(100000, 999999);

  cy.window({ log: false }).then((window) => {
    // @ts-expect-error not in the cypress type
    window['cypress-visit-id'] = pageLoadId;
  });

  cy.log(`Tracking page visit with ID ${pageLoadId}`);

  return cy.wrap(pageLoadId, { log: false });
});

/**
 * Asserts that a browser page visit (e.g. via navigation or reload) has occurred.
 *
 * @param alias - Alias to the current page load ID.
 *
 * @returns Cypress chainable.
 */
Cypress.Commands.add(
  'expectNewPageVisit',
  { prevSubject: false },
  (alias: string) => {
    return cy.get<any>(alias, { log: false }).then((pageLoadId) => {
      const log = Cypress.log({
        autoEnd: false,
        end: false,
        message: `Expecting window not to have page visit ID ${pageLoadId}`,
        name: 'expectNewPageVisit',
      });

      cy.window({ log: false }).should(
        'not.have.prop',
        'cypress-visit-id',
        pageLoadId
      );
      log.end();
    });
  }
);
