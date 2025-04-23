/**
 * UI helpers for Cloud Manager top app bar.
 */
export const appBar = {
  /**
   * Finds the app bar.
   *
   * @returns Cypress chainable.
   */
  find: () => {
    return cy.get('[data-qa-appbar]');
  },
};
