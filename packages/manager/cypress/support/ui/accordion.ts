/**
 * UI helpers for accordion panel headings.
 */
export const accordionHeading = {
  /**
   * Finds an accordion with the given title.
   *
   * @param title - Title of the accordion header to find.
   *
   * @returns Cypress chainable.
   */
  findByTitle: (title: string) => {
    // We have to rely on the selector because some accordion titles contain
    // other React components within them.
    return cy.findByText(title, {
      selector: '[data-qa-panel-subheading], [data-qa-panel-subheading] *',
    });
  },
};

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
    // We have to rely on the selector because some accordion titles contain
    // other React components within them.
    return cy
      .findByText(title, {
        selector: '[data-qa-panel-subheading], [data-qa-panel-subheading] *',
      })
      .closest('[data-qa-panel]')
      .find('[data-qa-panel-details]');
  },
};
