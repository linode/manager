import { Labelable } from './commands';

import type { LinodeVisitOptions } from './login.ts';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      checkSnapshot(subject: Cypress.PrevSubject, name: string): Chainable<>;

      /**
       * Yields a Cypress Promise from the given native Promise.
       *
       * @example cy.defer(new Promise('value')).then((val) => {...})
       */
      defer<T>(
        promise: Promise<T>,
        labelOrOptions?:
          | Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
          | string
      ): Chainable<>;

      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      visitWithLogin(
        url: string,
        linodeOptions?: LinodeVisitOptions,
        cypressOptions?: Partial<Cypress.VisitOptions>
      ): Chainable<any>;

      /**
       * Assigns a random page visit ID to the current page.
       *
       * Used to determine whether navigation has occurred later.
       *
       * @example
       * // After initial call to `cy.visit()` or `cy.visitWithLogin()`:
       * cy.trackPageVisit().as('pageVisit');
       * // Later in the tests, to assert that navigation has occurred:
       * cy.expectNewPageVisit('@pageVisit');
       *
       * @returns Cypress chainable that yields the random page visit ID.
       */
      trackPageVisit(): Chainable<number>;

      /**
       * Asserts that a browser page visit (e.g. navigation or reload) has occurred.
       *
       * @example
       * // After initial call to `cy.visit()` or `cy.visitWithLogin()`:
       * cy.trackPageVisit().as('pageVisit');
       * // Later in the tests, to assert that navigation has occurred:
       * cy.expectNewPageVisit('@pageVisit');
       *
       * @param alias - Alias to the current page load ID.
       *
       * @returns Cypress chainable.
       */
      expectNewPageVisit(alias: string): Chainable<>;

      /**
       * Internal Cypress command to retrieve test state.
       *
       * @param state - Cypress internal state to retrieve.
       */
      state(state: string): any;
    }
  }
}
