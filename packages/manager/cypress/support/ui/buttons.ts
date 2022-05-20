/**
 * Button group UI element.
 *
 * Generally used to contain buttons in drawers and dialogs.
 */
export const buttonGroup = {
  /**
   * Finds a button group and returns the Cypress chainable.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-buttons="true"]');
  },

  /**
   * Finds a button within a button group by its title and returns the Cypress chainable.
   *
   * @param buttonTitle - Title of button to find.
   *
   * @returns Cypress chainable.
   */
  findButtonByTitle: (buttonTitle: string): Cypress.Chainable => {
    return cy
      .get('[data-qa-buttons="true"]')
      .findByText(buttonTitle)
      .closest('button');
  },
};
