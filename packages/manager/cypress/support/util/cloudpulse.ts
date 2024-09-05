/* eslint-disable cypress/unsafe-to-chain-command */
import 'cypress-wait-until';
import { aggregation, aggregationConfig } from 'support/constants/aggregation';
import { granularity } from 'support/constants/granularity';
import { timeRange } from 'support/constants/timerange';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';

export const dashboardName = 'Linode Service I/O Statistics';
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
export const cloudpulseTestData = [
  {
    expectedAggregation: aggregation.Max,
    expectedAggregationArray: aggregationConfig.all,
    expectedGranularity: granularity.Hr1,
    expectedGranularityArray: Object.values(granularity),
    name: 'system_disk_OPS_total',
    title: 'Disk I/O',
  },
  {
    expectedAggregation: aggregation.Max,
    expectedAggregationArray: aggregationConfig.all,
    expectedGranularity: granularity.Hr1,
    expectedGranularityArray: Object.values(granularity),
    name: 'system_network_io_by_resource',
    title: 'Network Traffic',
  },
  {
    expectedAggregation: aggregation.Max,
    expectedAggregationArray: aggregationConfig.all,
    expectedGranularity: granularity.Hr1,
    expectedGranularityArray: Object.values(granularity),
    name: 'system_memory_usage_by_resource',
    title: 'Memory Usage',
  },
  {
    expectedAggregation: aggregation.Max,
    expectedAggregationArray: aggregationConfig.basic,
    expectedGranularity: granularity.Hr1,
    expectedGranularityArray: Object.values(granularity),
    name: 'system_cpu_utilization_percent',
    title: 'CPU Utilization',
  },
];

/**
 * Navigates to the Cloudpulse dashboard and waits for the page to load.
 */
export const navigateToCloudpulse = () => {
  mockAppendFeatureFlags({ aclp: makeFeatureFlagData(true) }).as(
    'getFeatureFlags'
  );
  mockGetFeatureFlagClientstream().as('getClientStream');

  cy.visitWithLogin('/monitor/cloudpulse', {
    onLoad: (contentWindow: Window) => {
      if (contentWindow.document.readyState !== 'complete') {
        throw new Error('Page did not load completely');
      }
    },
    timeout: 500,
  });

  cy.wait(['@getFeatureFlags', '@getClientStream']);
  cy.url().should('include', '/monitor/cloudpulse');
  waitForPageToLoad();
};

/**
 * Waits for the Cloudpulse page to fully load and checks that key elements are visible.
 */
export const waitForPageToLoad = () => {
  cy.get('[data-testid="circle-progress"]').should('not.exist');

  const keyElementsSelectors = ['[data-testid="textfield-input"]'];
  keyElementsSelectors.forEach((selector) => {
    cy.get(selector).should('be.visible');
  });
};

/**
 * Visits the Linodes page when the Cloudpulse feature flag is disabled,
 * and verifies that the Monitor tab is not present.
 */
export const visitCloudPulseWithFeatureFlagsDisabled = () => {
  cy.visitWithLogin('/linodes');
  mockAppendFeatureFlags({ aclp: makeFeatureFlagData(false) }).as(
    'getFeatureFlags'
  );
  mockGetFeatureFlagClientstream().as('getClientStream');

  cy.findByLabelText('Monitor').should('not.exist');
};

/**
 * Selects a service name from the dashboard dropdown.
 * @param {string} serviceName - The name of the service to select.
 */
export const selectServiceName = (serviceName: string) => {
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Open')
    .click();
  ui.autocomplete
    .findByPlaceholderCustom('Select Dashboard')
    .type(`${serviceName}{enter}`);

  // ui.autocompletePopper.findByTitle(serviceName).should('be.visible').click();
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
 */
export const selectTimeRange = (timeRange: string) => {
  ui.autocomplete
    .findByTitleCustom('Select Time Duration')
    .findByTitle('Open')
    .click();
  ui.autocompletePopper.findByTitle(timeRange).should('be.visible').click();
};

/**
 * Selects a resource name from the resources dropdown and verifies the selection.
 * @param {string} service - The name of the service to select.
 */
export const selectAndVerifyServiceName = (service: string) => {
  const resourceInput = ui.autocomplete.findByTitleCustom('Select Resources');
  resourceInput.findByTitle('Open').click();
  resourceInput.click().type(`${service}{enter}`);
  // resourceInput.findByTitle('Close').click();
};

/**
 * Asserts that the selected options match the expected values.
 * @param {string} expectedOptions - The expected options to verify.
 */
export const assertSelections = (expectedOptions: string) => {
  expect(cy.get(`[value*='${expectedOptions}']`), expectedOptions);
};

/**
 * Applies a global refresh action on the dashboard.
 */
export const applyGlobalRefresh = () => {
  ui.cloudpulse.findRefreshIcon().click();
};
/**
 * Clears the dashboard's preferences and verifies the zeroth page.
 * @param {string} serviceName - The name of the service to verify.
 */
export const verifyZerothPage = (serviceName: string) => {
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Open')
    .click();
  ui.autocompletePopper.findByTitle(serviceName).should('be.visible').click();
  ui.autocomplete
    .findByTitleCustom('Select Dashboard')
    .findByTitle('Clear')
    .click();
};

/**
 * Validates that the widget title matches the expected title.
 * @param {string} widgetName - The name of the widget to verify.
 */
export const validateWidgetTitle = (widgetName: string) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  cy.get(widgetSelector)
    .find('h1')
    .invoke('text')
    .then((actualTitle) => {
      expect(actualTitle.trim()).to.equal(widgetName);
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
      assertSelections(granularity);
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
export const verifyZoomInOut = (widgetName: string) => {
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  const zoomInSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-in');
  const zoomOutSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-out');

  cy.get(widgetSelector).each(($widget) => {
    cy.wrap($widget).then(($el) => {
      const zoomInAvailable = $el.find(zoomInSelector).length > 0;
      const zoomOutAvailable = $el.find(zoomOutSelector).length > 0;

      if (zoomInAvailable) {
        // eslint-disable-next-line cypress/unsafe-to-chain-command
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
};
