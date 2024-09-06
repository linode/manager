/* eslint-disable cypress/unsafe-to-chain-command */
import { accountFactory, profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { granularity } from 'support/constants/granularity';
import { timeRange } from 'support/constants/timerange';
import { mockGetAccount, mockGetUser } from 'support/intercepts/account';
import {
  interceptGetDashBoards,
  interceptGetMetricDefinitions,
  interceptGetResources,
  interceptMetricAPI,
} from 'support/intercepts/cloudpulseAPIHandler';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';

import type { Flags } from 'src/featureFlags';
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

 interface MetricResponse {
  data: {
    result: Array<{
      metric: Record<string, any>;
      values: [number, string][];
    }>;
    resultType: string;
  };
  isPartial: boolean;
  stats: {
    executionTimeMsec: number;
    seriesFetched: string;
  };
  status: string;
}
/**
 * Generates a mock metric response based on the specified time range and granularity.
 * 
 * This function:
 * 1. Determines the time interval based on the granularity (e.g., 5 minutes, 1 hour, 1 day).
 * 2. Calculates the time range in seconds based on the specified time range (e.g., last 12 hours, last 30 days).
 * 3. Creates a series of random metric values for the given time range at the specified interval.
 * 4. Returns a mock response object containing the generated metric data.
 * 
 * @param {string} time - The time range for the metric data (e.g., "Last12Hours").
 * @param {string} granularityData - The granularity of the metric data (e.g., "Min5").
 * @returns {MetricResponse} - The generated mock metric response.
 */
export const createMetricResponse = (
  time: string,
  granularityData: string
): MetricResponse => {
  const currentTime = Math.floor(Date.now() / 1000);

  const intervals: Record<string, number> = {
    [granularity.Auto]: 3600,
    [granularity.Day1]: 86400,
    [granularity.Hr1]: 3600,
    [granularity.Min5]: 5 * 60,
  };

  const timeRanges: Record<string, number> = {
    [timeRange.Last7Days]: 7 * 24 * 3600,
    [timeRange.Last12Hours]: 12 * 3600,
    [timeRange.Last24Hours]: 24 * 3600,
    [timeRange.Last30Days]: 30 * 24 * 3600,
    [timeRange.Last30Minutes]: 30 * 60,
  };

  const interval =
    intervals[granularityData] ||
    (() => {
      throw new Error(`Unsupported granularity: ${granularityData}`);
    })();
  const timeRangeInSeconds =
    timeRanges[time] ||
    (() => {
      throw new Error(`Unsupported time range: ${time}`);
    })();
  const startTime = currentTime - timeRangeInSeconds;

  const values: [number, string][] = Array.from(
    { length: Math.ceil(timeRangeInSeconds / interval) + 1 },
    (_, i) => {
      const timestamp = startTime + i * interval;
      const value = (Math.random() * 100).toFixed(2);
      return [timestamp, value];
    }
  );

  return {
    data: {
      result: [{ metric: {}, values }],
      resultType: 'matrix',
    },
    isPartial: false,
    stats: {
      executionTimeMsec: 53,
      seriesFetched: '6',
    },
    status: 'success',
  };
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
  ui.autocomplete .findByPlaceholderCustom('Select Dashboard').type(`${serviceName}{enter}`);
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
export const selectAndVerifyResource  = (service: string) => {
  const resourceInput = ui.autocomplete.findByTitleCustom('Select Resources');
  resourceInput.findByTitle('Open').click();
  resourceInput.click().type(`${service}{enter}`);
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
  ui.autocomplete .findByPlaceholderCustom('Select Dashboard').type(`${serviceName}{enter}`);
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
  const widgetSelector = `[data-qa-widget="${widgetName}"]`;
  return cy
    .get(widgetSelector)
    .find('h1')
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
export const checkZoomActions = (widgetName: string) => {
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
};

const mockParentProfile = profileFactory.build({
  user_type: 'parent',
  username: 'mock-user@linode.com',
});

const mockParentUser = accountUserFactory.build({
  user_type: 'default',
  username: mockParentProfile.email,
});
const mockParentAccount = accountFactory.build({
  company: 'Parent Company',
});
/**
 * Sets up mock data and intercepts for user-related tests.
 * 
 * This function:
 * 1. Mocks responses for user profile, account, and user data APIs.
 * 2. Configures feature flags for testing.
 * 3. Mocks the feature flag client stream.
 * 4. Visits the specified page with a logged-in user.
 * 5. Sets up intercepts for various API calls and aliases them for testing.
 * 
 * This ensures a controlled environment for testing user-related functionality.
 */
export const initializeMockUserData = () => {
  mockGetProfile(mockParentProfile);
  mockGetAccount(mockParentAccount);
  mockGetUser(mockParentUser);
  mockAppendFeatureFlags({
    aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
  });
  mockGetFeatureFlagClientstream();
  cy.visitWithLogin('monitor/cloudpulse');
  interceptGetMetricDefinitions().as('dashboardMetricsData');
  interceptGetDashBoards().as('dashboard');
  interceptGetResources().as('resourceData');
  const responsePayload = createMetricResponse(
    actualRelativeTimeDuration,
    granularity.Min5
  );
  interceptMetricAPI(responsePayload).as('metricAPI');
};
