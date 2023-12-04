/**
 * UI helpers for accordion panels.
 */
export const accordion = {
  /**
   * Finds an accordion.
   *
   * @returns Cypress chainable.
   */
  find: () => {
    return cy.get('[data-qa-panel]');
  },

  /**
   * Finds an accordion with the given title.
   *
   * @param title - Title of the accordion to find.
   *
   * @returns Cypress chainable.
   */
  findByTitle: (title: string) => {
    return cy.get(`[data-qa-panel="${title}"]`).find('[data-qa-panel-details]');
  },
};
