/**
 * Button UI element.
 */
export const button = {
  /**
   * Finds a button by the value of a given attribute.
   *
   * @param attributeName - Attribute to compare against.
   * @param attributeValue - Expected value for attribute.
   *
   * @returns Cypress chainable.
   */
  findByAttribute: (
    attributeName: string,
    attributeValue: string
  ): Cypress.Chainable => {
    return cy.get(`button[${attributeName}="${attributeValue}"]`);
  },

  /**
   * Finds a button by its title.
   *
   * Most buttons in Cloud Manager have a child `<span />` element containing
   * the title text. Hence, the `<button />` element itself must be selected
   * by traversing the DOM.
   *
   * @param buttonTitle - Title of button to find.
   *
   * @returns Cypress chainable.
   */
  findByTitle: (buttonTitle: string): Cypress.Chainable => {
    return cy.findByText(buttonTitle).closest('button');
  },
};

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

export const cdsButton = {
  /**
   * Finds a cds button within shadow DOM by its title and returns the Cypress chainable.
   *
   * @param cdsButtonTitle - Title of cds button to find
   *
   * @returns Cypress chainable.
   */
  findButtonByTitle: (cdsButtonTitle: string): Cypress.Chainable => {
    return cy
      .findByText(cdsButtonTitle)
      .closest('cds-button')
      .shadow()
      .find('button');
  },
};
