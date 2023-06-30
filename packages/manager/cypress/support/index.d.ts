import type { LinodeVisitOptions } from './login.ts';
import type { CommonRequestMockOptions } from './intercepts/common';
import { Labelable } from './commands';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
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
       * Yields a Cypress Promise from the given native Promise.
       *
       * @example cy.defer(new Promise('value')).then((val) => {...})
       */
      defer<T>(
        promise: Promise<T>,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
      ): Chainable<>;

      //mockCommonRequests(options?: CommonRequestMockOptions | undefined): Chainable<>;

      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      checkSnapshot(subject: Cypress.PrevSubject, name: string): Chainable<>;
    }
  }
}
