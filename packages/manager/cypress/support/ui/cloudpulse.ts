/**
 * cloudpulse RefreshIcon,Zoom Button UI element.
 */
export const cloudpulse = {
  /**
   * Finds a refresh button within the UI and returns the corresponding Cypress chainable object.
   * This method is useful for locating and interacting with the refresh button in the user interface.
   *
   * @returns {Cypress.Chainable} - A Cypress chainable object representing the refresh button.
   */
  findRefreshIcon: (): Cypress.Chainable => {
    return cy.get('[data-qa-refresh-button="true"]');
  },

  /**
   * Generates a selector for a zoom button within a button group based on its title.
   * This method helps in locating specific zoom buttons by their title attribute within a group of buttons.
   *
   * @param {string} buttonTitle - The title of the zoom button to find.
   *
   * @returns {string} - A string representing the CSS selector for the zoom button.
   */
  findZoomButtonByTitle: (buttonTitle: string): string => {
    return `[data-qa-zoomer="${buttonTitle}"]`;
  },
};
