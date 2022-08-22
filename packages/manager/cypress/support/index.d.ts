import type { LinodeVisitOptions } from './login.ts';
import type { CommonRequestMockOptions } from './intercepts/common';

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
       * Custom command to get a Cypress Promise that can be used in place of the given Promise.
       *
       * @example cy.defer(new Promise('value')).then((val) => {...})
       */
      defer(promise: Promise<any>): Chainable<>;

      //mockCommonRequests(options?: CommonRequestMockOptions | undefined): Chainable<>;

      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      checkSnapshot(subject: Cypress.PrevSubject, name: string): Chainable<>;
    }
  }
}
