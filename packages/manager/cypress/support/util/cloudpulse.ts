/* eslint-disable sonarjs/no-all-duplicated-branches */
/**
 * This class provides utility functions for interacting with the Cloudpulse dashboard
 * in a Cypress test suite. It includes methods for:
 * - Navigating to the Cloudpulse page
 * - Selecting and verifying dashboard options (service names, regions, time ranges)
 * - Managing feature flags
 * - Setting and validating widget configurations (granularity, aggregation)
 * - Performing actions like zooming in and out on widgets
 * These utilities ensure efficient and consistent test execution and validation.
 */

/**
 * Selects a service name from the dashboard dropdown.
 * @param {string} serviceName - The name of the service to select.
 */
import { ui } from 'support/ui';

/**
 * Waits for the element matching the given CSS selector to appear and become visible.
 *
 * @param {string} selector - The CSS selector for the element to wait for.
 */
//  command to wait for the element to be fully loaded

export const selectServiceName = (serviceName: string) => {
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Open')
    .should('be.visible')
    .click();
  ui.autocomplete
    .findByPlaceholderCustom('Select Dashboard')
    .type(`${serviceName}{enter}`);
  cy.findByDisplayValue(serviceName).should('have.value', serviceName);
};

/**
 * Selects a time range from the time range dropdown.
 * @param {string} timeRange - The time range to select.
 * @param {Array<string>} timeSegments - An array of time segment values (e.g., ["2024-01-01", "2024-01-02"]).

 */
export const selectTimeRange = (timeRange: string, timeSegments: string[]) => {
  ui.autocomplete
    .findByTitleCustom('Select Time Duration')
    .findByTitle('Open')
    .click();
  timeSegments.forEach((option) => {
    ui.autocompletePopper.findByTitle(option).should('be.visible');
  });
  ui.autocompletePopper.findByTitle(timeRange).should('be.visible').click();
  cy.findByDisplayValue(timeRange).should('have.value', timeRange);
};
/**
 * Selects a resource name from the resources dropdown and verifies the selection.
 * @param {string} service - The name of the service to select.
 */
export const selectAndVerifyResource = (service: string) => {
  const resourceInput = ui.autocomplete.findByTitleCustom('Select Resources');
  resourceInput.findByTitle('Open').click();
  resourceInput.click().type(`${service}{enter}`);
  cy.get('[title="Close"]').click();
};
/**
 * Asserts that the selected options match the expected values.
 * @param {string} expectedOptions - The expected options to verify.
 */
export const assertSelections = (expectedOptions: string) => {
  cy.get(`[value*='${expectedOptions}']`).should('be.visible');
  cy.get(`[value*='${expectedOptions}']`).should('have.value', expectedOptions);
};

/**
 * Clears the dashboard's preferences and verifies the zeroth page.
 */
export const resetDashboard = () => {
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Clear')
    .click();

  ui.autocomplete
    .findByPlaceholderCustom('Select Dashboard')
    .should('have.value', '');
};
/**
 * Selects an engine from a dropdown menu.
 *
 * @param {string} engine - The engine to be selected.
 */
export const chooseEngine = (engine: string) => {
  ui.autocomplete
    .findByTitleCustom('Select a Value')
    .findByTitle('Open')
    .click();
  ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
  cy.findByDisplayValue(engine).should('have.value', engine);
};
/**
 * Selects a node type from a dropdown menu.
 *
 * @param {string} node - The node type to be selected.
 */

export const chooseNodeType = (node: string) => {
  ui.autocomplete
    .findByPlaceholderCustom('Select Node Type')
    .should('be.visible')
    .type(node)
    .click();
  ui.autocompletePopper.findByTitle(node).should('be.visible').click();
  cy.findByDisplayValue(node).should('have.value', node);
};
