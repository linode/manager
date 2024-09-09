/* eslint-disable cypress/unsafe-to-chain-command */
import { timeRange } from 'support/constants/widget-service';
import { ui } from 'support/ui';

export const dashboardName = 'Linode Dashboard';
export const region = 'US, Chicago, IL (us-ord)';
export const actualRelativeTimeDuration = timeRange.Last24Hours;
export const resource = 'test1';
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
 * Selects a region from the region dropdown.
 * @param {string} region - The name of the region to select.
 */
export const selectRegion = (region: string) => {
  ui.regionSelect.find().click().type(`${region}{enter}`);
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
 * Applies a global refresh action on the dashboard.
 */
export const performGlobalRefresh = () => {
  ui.cloudpulse.findRefreshIcon().click();
};
/**
 * Clears the dashboard's preferences and verifies the zeroth page.
 * @param {string} serviceName - The name of the service to verify.
 */
export const resetDashboardAndVerifyPage = (serviceName: string) => {
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Open')
    .click();
  ui.autocomplete
    .findByPlaceholderCustom('Select Dashboard')
    .clear()
    .type(`${serviceName}{enter}`);
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Clear')
    .click();
};
/**
 * Validates that the widget title matches the expected title.
 *
 * This function locates a widget on the page using its `data-qa-widget` attribute,
 * finds the `h1` element within the widget, and checks that its text content matches
 * the expected widget name. It also returns the actual text content of the `h1` element.
 *
 * @param {string} widgetName - The expected name of the widget to verify. This is used to
 *                              construct the selector and to check the title of the widget.
 *
 * @returns {Cypress.Chainable<string>} A Cypress chainable object that resolves to the
 *                                      text content of the `h1` element within the widget.
 */
export const validateWidgetTitle = (widgetName: string) => {
  const widgetSelector = `h1[data-qa-widget-header="${widgetName}"]`;
  return cy
    .get(widgetSelector)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(widgetName);
    });
};

/**
 * Sets the granularity of a widget.
 * @param {string} widgetName - The name of the widget to set granularity for.
 * @param {string} granularity - The granularity to select.
 */
export const setGranularity = (widgetName: string, granularity: string) => {
  cy.log('widgetName***', widgetName);
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  cy.get(widgetSelector)
    .first()
    .should('be.visible')
    .within(() => {
      ui.autocomplete
        .findByTitleCustom('Select an Interval')
        .findByTitle('Open')
        .click();
      ui.autocompletePopper
        .findByTitle(granularity)
        .should('be.visible')
        .click();
      //  assertSelections(granularity);
    });
};
/**
 * Sets the aggregation function of a widget.
 * @param {string} widgetName - The name of the widget to set aggregation for.
 * @param {string} aggregation - The aggregation function to select.
 */
export const setAggregation = (widgetName: string, aggregation: string) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  cy.get(widgetSelector)
    .first()
    .should('be.visible')
    .within(() => {
      ui.autocomplete
        .findByTitleCustom('Select an Aggregate Function')
        .findByTitle('Open')
        .click();
      ui.autocompletePopper
        .findByTitle(aggregation)
        .should('be.visible')
        .click();
      assertSelections(aggregation);
    });
};
/**
 * Verifies that the granularity options available for a widget match the expected options.
 * @param {string} widgetName - The name of the widget to verify.
 * @param {string[]} expectedGranularityOptions - The expected granularity options.
 */
export const verifyGranularity = (
  widgetName: string,
  expectedGranularityOptions: string[]
) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  cy.get(widgetSelector)
    .first()
    .scrollIntoView()
    .should('be.visible')
    .within(() => {
      ui.autocomplete
        .findByTitleCustom('Select an Interval')
        .findByTitle('Open')
        .click();
      expectedGranularityOptions.forEach((option) => {
        ui.autocompletePopper
          .findByTitle(option)
          .should('be.visible')
          .then(() => {
            cy.log(`${option} is visible`);
          });
      });
      ui.autocomplete
        .findByTitleCustom('Select an Interval')
        .findByTitle('Close')
        .click();
    });
};

/**
 * Verifies that the aggregation options available for a widget match the expected options.
 * @param {string} widgetName - The name of the widget to verify.
 * @param {string[]} expectedAggregationOptions - The expected aggregation options.
 */

export const verifyAggregation = (
  widgetName: string,
  expectedAggregationOptions: string[]
) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  cy.get(widgetSelector)
    .first()
    .scrollIntoView()
    .should('be.visible')
    .within(() => {
      ui.autocomplete
        .findByTitleCustom('Select an Aggregate Function')
        .findByTitle('Open')
        .click();
      expectedAggregationOptions.forEach((option) => {
        ui.autocompletePopper
          .findByTitle(option)
          .should('be.visible')
          .then(() => {
            cy.log(`${option} is visible`);
          });
      });
      ui.autocomplete
        .findByTitleCustom('Select an Aggregate Function')
        .findByTitle('Close')
        .click();
    });
};

/**
 * Verifies that zoom in and zoom out actions are available and performs them on a widget.
 * @param {string} widgetName - The name of the widget to zoom in or out.
 */

export const checkZoomActions = (widgetName: string) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  //const zoomInSelector = 'svg[data-testid="zoom-in"]';
 // const zoomOutSelector = 'svg[data-testid="zoom-out"]';
 const zoomInSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-in');
  const zoomOutSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-out');
cy.get(widgetSelector).each(($widget) => {
    cy.wrap($widget).then(($el) => {
      const zoomInElement = $el.find(zoomInSelector);
      const zoomOutElement = $el.find(zoomOutSelector);
    if (zoomOutElement.length > 0) {
        cy.wrap(zoomOutElement)
          .should('be.visible')
          .click({ timeout: 5000 })
          .then(() => {
            cy.log('Zoomed Out on widget:', $el);
          });
      } else if (zoomInElement.length > 0) {
        cy.wrap(zoomInElement)
          .should('be.visible')
          .click({ timeout: 5000 })
          .then(() => {
            cy.log('Zoomed In on widget:', $el);
          });
      }
    });
  });
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
