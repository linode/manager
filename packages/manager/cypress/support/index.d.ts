import type { Labelable } from './commands';
import type { LinodeVisitOptions } from './login.ts';
import type { mount } from 'cypress/react';
import type { TestTag } from 'support/util/tag';

declare global {
  namespace Cypress {
    interface Cypress {
      mocha: Mocha;
    }

    interface Chainable {
      /**
       * Adds tags for the given runnable.
       *
       * If tags have already been set (e.g. using a hook), this method will add
       * the given tags in addition the tags that have already been set.
       *
       * Alias for `addTag()` in `support/util/tag.ts`.
       *
       * @param tags - Test tags.
       */
      addTag(...tags: TestTag[]): void;

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
        promiseGenerator: () => Promise<T>,
        labelOrOptions?:
          | Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
          | string
      ): Chainable<>;

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
       * Mount a React component via `cypress/react`.
       */
      mount: typeof mount;

      /**
       * Internal Cypress command to retrieve test state.
       *
       * @param state - Cypress internal state to retrieve.
       */
      state(state?: string): any;

      /**
       * Sets tags for the current runnable.
       *
       * Alias for `tag()` in `support/util/tag.ts`.
       *
       * @param tags - Tags to set for test or runnable.
       */
      tag(...tags: TestTag[]): void;

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
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      visitWithLogin(
        url: string,
        linodeOptions?: LinodeVisitOptions,
        cypressOptions?: Partial<Cypress.VisitOptions>
      ): Chainable<any>;
    }
  }
}
