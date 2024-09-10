
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
  // Commenting out the line because resourceInput.findByTitle('closure') does not work
  // resourceInput.findByTitle('Close').click();
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
 * @param {string} serviceName - The name of the service to verify.
 */
export const resetDashboardAndVerifyPage = (serviceName: string) => {

  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Clear')
    .click();
    ui.autocomplete
    .findByPlaceholderCustom('Select Dashboard')
    .should('have.value', ''); // Ensure the input field is cleared
};

/* export const checkZoomActions1 = (widgetName: string) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  const zoomInSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-in');
  const zoomOutSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-out');

  cy.get(widgetSelector).each(($widget) => {
    cy.wrap($widget).then(($el) => {
      const zoomInAvailable = $el.find(zoomInSelector).length > 0;
      const zoomOutAvailable = $el.find(zoomOutSelector).length > 0;

      if (zoomInAvailable) {
        cy.wrap($el)
          .find(zoomInSelector)
          .should('be.visible')
          .click({ timeout: 5000 })
          .then(() => {
            cy.log('Zoomed In on widget:', $el);
          });
      } else if (zoomOutAvailable) {
        cy.wrap($el)
          .find(zoomOutSelector)
          .should('be.visible')
          .click({ timeout: 5000 })
          .then(() => {
            cy.log('Zoomed Out on widget:', $el);
          });
      } else {
        cy.log(
          'Neither ZoomInMapIcon nor ZoomOutMapIcon found for widget:',
          $el
        );
      }
    });
  });
};*/
