declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    visitWithLogin(
      url: string,
      options?: Partial<Cypress.VisitOptions>
    ): Chainable<>;

    /**
     * Custom command to get a Cypress Promise that can be used in place of the given Promise.
     *
     * @example cy.defer(new Promise('value')).then((val) => {...})
     */
    defer(promise: Promise<any>): Chainable<>;

    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    checkSnapshot(subject: Cypress.PrevSubject, name: string): Chainable<>;
  }
}
