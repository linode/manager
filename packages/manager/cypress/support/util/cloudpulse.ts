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
    .findByLabel('Select a Dashboard')
    .should('be.visible')
    .type(`${serviceName}{enter}`)
    .should('have.value', serviceName);
};

/**
 * Selects a time range from the time range dropdown.
 * @param {string} timeRange - The time range to select.
 * @param {Array<string>} timeSegments - An array of time segment values (e.g., ["2024-01-01", "2024-01-02"]).

 */
export const selectTimeRange = (timeRange: string) => {
  ui.autocomplete
    .findByLabel('Select a Time Duration')
    .should('be.visible')
    .type(`${timeRange}{enter}`)
    .should('have.value', timeRange);
};
/**
 * Selects a resource name from the resources dropdown and verifies the selection.
 * @param {string} service - The name of the service to select.
 */
export const selectAndVerifyResource = (service: string) => {
  ui.autocomplete
    .findByLabel('Select a Resources')
    .should('be.visible')
    .type(`${service}{enter}`);
  cy.get('[title="Close"]').click();
};

/**
 * Selects an engine from a dropdown menu.
 *
 * @param {string} engine - The engine to be selected.
 */
export const chooseEngine = (engine: string) => {
  ui.autocomplete
    .findByLabel('Select an Engine')
    .should('be.visible')
    .type(`${engine}{enter}`)
    .should('have.value', engine);
};
/**
 * Selects a node type from a dropdown menu.
 *
 * @param {string} node - The node type to be selected.
 */

export const chooseNodeType = (node: string) => {
  ui.autocomplete
    .findByLabel('Select a Node Type')
    .should('be.visible')
    .type(`${node}{enter}`)
    .should('have.value', node);
};
