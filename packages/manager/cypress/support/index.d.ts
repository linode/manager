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

      // mockCommonRequests(options?: CommonRequestMockOptions | undefined): Chainable<>;

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
       * Internal Cypress command to retrieve test state.
       */
      state(state: string): any;
    }
  }
}
