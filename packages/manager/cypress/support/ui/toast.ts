/**
 * Toast notification UI element.
 */
export const toast = {
  /**
   * Finds a toast notification element by its message contents.
   *
   * Toast notifications are short lived, so actions or assertions should be
   * made as quickly as possible after finding the element.
   *
   * @param message - Message for the toast that should be found.
   *
   * @returns Cypress chainable.
   */
  findByMessage: (message: string): Cypress.Chainable => {
    return cy.contains('[data-qa-toast]', message);
  },

  /**
   * Asserts that a toast notification with the given message is displayed.
   *
   * @param message - Message for the toast being asserted.
   *
   * @returns Cypress chainable.
   */
  assertMessage: (message: string): void => {
    cy.contains('[data-qa-toast]', message).should('be.visible');
  },
};
