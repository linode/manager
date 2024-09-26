import {
  selectTimeRange,
  selectServiceName,
  selectAndVerifyResource,
  assertSelections,
} from 'support/util/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCloudPulseJWSToken,
  mockCloudPulseDashboardServicesResponse,
  mockCloudPulseCreateMetrics,
  mockCloudPulseGetDashboards,
  mockCloudPulseGetMetricDefinitions,
  mockCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { ui } from 'support/ui';
import { widgetDetails } from 'support/constants/widgets';
import { createMetricResponse } from '@src/factories/widget';
import {
  accountFactory,
  dashboardFactory,
  dashboardMetricFactory,
  kubeLinodeFactory,
  linodeFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { extendRegion } from 'support/util/regions';
import { CloudPulseMetricsResponse } from '@linode/api-v4';
import { transformData } from 'src/features/CloudPulse/Utils/unitConversion';
import { getMetrics } from 'src/utilities/statMetrics';
const timeRanges = {
  last7Days: 'Last 7 Days',
  last12Hours: 'Last 12 Hours',
  last24Hours: 'Last 24 Hours',
  last30Days: 'Last 30 Days',
  last30Minutes: 'Last 30 Minutes',
};
const y_labels = [
  'system_cpu_utilization_ratio',
  'system_memory_usage_bytes',
  'system_network_io_bytes_total',
  'system_disk_operations_total',
];
const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];

/**
 * This test ensures that widget titles are displayed correctly on the dashboard.
 * This test suite is dedicated to verifying the functionality and display of widgets on the Cloudpulse dashboard.
 *  It includes:
 * Validating that widgets are correctly loaded and displayed.
 * Ensuring that widget titles and data match the expected values.
 * Verifying that widget settings, such as granularity and aggregation, are applied correctly.
 * Testing widget interactions, including zooming and filtering, to ensure proper behavior.
 * Each test ensures that widgets on the dashboard operate correctly and display accurate information.
 */

const metrics = widgetDetails.linode.metrics;
const widgetLabels: string[] = metrics.map((widget) => widget.title);
const metricsLabels: string[] = metrics.map((widget) => widget.name);
const unit: string[] = metrics.map((widget) => widget.unit);
const dashboard = dashboardFactory.build({
  label: widgetDetails.linode.dashboardName,
  service_type: widgetDetails.linode.service_type,
  widgets: [
    ...widgetLabels.map((label: string, index: number) =>
      widgetFactory.build({
        label,
        y_label: y_labels[index],
        metric: metricsLabels[index],
        unit: unit[index],
      })
    ),
  ],
});

const metricDefinitions = {
  data: [
    ...widgetLabels.map((label, index) =>
      dashboardMetricFactory.build({
        label,
        metric: metricsLabels[index],
        unit: unit[index],
      })
    ),
  ],
};
const mockKubeLinode = kubeLinodeFactory.build();
const mockLinode = linodeFactory.build({
  label: widgetDetails.linode.resource,
  id: mockKubeLinode.instance_id ?? undefined,
});
const mockAccount = accountFactory.build();
const mockRegion = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    country: 'us',
  })
);
let responsePayload: CloudPulseMetricsResponse;
describe('Dashboard Widget Verification Tests', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    }).as('getFeatureFlags');
    mockGetAccount(mockAccount).as('getAccount'); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockCloudPulseGetMetricDefinitions(
      metricDefinitions,
      widgetDetails.linode.service_type
    );
    mockCloudPulseGetDashboards(
      dashboard,
      widgetDetails.linode.service_type
    ).as('dashboard');
    mockCloudPulseServices(widgetDetails.linode.service_type).as('services');
    mockCloudPulseDashboardServicesResponse(dashboard, widgetDetails.linode.id);
    mockCloudPulseJWSToken(widgetDetails.linode.service_type);
    responsePayload = createMetricResponse(timeRanges.last24Hours, '5 min');
    mockCloudPulseCreateMetrics(
      responsePayload,
      widgetDetails.linode.service_type
    ).as('getMetrics');
    mockGetRegions([mockRegion]).as('getRegions');
  });

  it('should verify the title of the widget', () => {
    setupMethod();
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget-header="${testData.title}"]`;
      cy.get(widgetSelector)
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(
            `${testData.title} (${testData.unit.trim()})`
          );
        });
    });
  });
  it('should verify available granularity of the widget', () => {
    setupMethod();
    metrics.forEach((testData) => {
      cy.wait(7000); //maintaining the wait since page flicker and rendering
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .scrollIntoView()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .findByTitle('Open')
            .click();
          expectedGranularityArray.forEach((option) => {
            ui.autocompletePopper.findByTitle(option).should('exist');
          });
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .should('be.visible')
            .findByTitle('Close')
            .should('be.visible')
            .click();
        });
    });
  });

  it('should verify available aggregation of the widget', () => {
    setupMethod();
    metrics.forEach((testData) => {
      cy.wait(7000); //maintaining the wait since page flicker and rendering
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .scrollIntoView()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .findByTitle('Open')
            .click();
          testData.expectedAggregationArray.forEach((option) => {
            ui.autocompletePopper.findByTitle(option).should('exist');
          });
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .should('be.visible')
            .findByTitle('Close')
            .should('be.visible')
            .click();
        });
    });
  });
  it('should set available granularity of all the widgets', () => {
    setupMethod();
    metrics.forEach((testData) => {
      cy.wait(7000); //maintaining the wait since page flicker and rendering
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector).as('widget');
      cy.get('@widget')
        .should('be.visible')
        .first()
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .should('be.visible')
            .findByTitle('Open')
            .click()
            .type(`${testData.expectedGranularity}{enter}`);
          cy.findByDisplayValue(testData.expectedGranularity).should('exist');
          cy.findByTestId('linegraph-wrapper')
            .as('canvas')
            .should('be.visible')
            .find('tbody tr')
            .each(($tr, index) => {
              const cells = $tr
                .find('td')
                .map((i, el) => {
                  const text = Cypress.$(el).text().trim();
                  return text.replace(/^\s*\([^)]+\)/, '');
                })
                .get();
              const [title, actualMax, actualAvg, actualLast] = cells;
              const widgetValues = verifyWidgetValues(responsePayload);
              compareWidgetValues(
                {
                  title,
                  max: parseFloat(actualMax),
                  average: parseFloat(actualAvg),
                  last: parseFloat(actualLast),
                },
                widgetValues,
                testData.title
              );
              assertSelections(testData.expectedGranularity);
            });
        });
    });
  });
  it('should set available aggregation of all the widgets', () => {
    setupMethod();
    metrics.forEach((testData) => {
      cy.wait(7000); //maintaining the wait since page flicker and rendering
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .should('be.visible')
            .findByTitle('Open')
            .click()
            .type(`${testData.expectedAggregation}{enter}`);
          cy.findByDisplayValue(testData.expectedAggregation).should('exist');
          cy.findByTestId('linegraph-wrapper')
            .as('canvas')
            .should('be.visible')
            .find('tbody tr')
            .each(($tr, index) => {
              const cells = $tr
                .find('td')
                .map((i, el) => {
                  const text = Cypress.$(el).text().trim();
                  return text.replace(/^\s*\([^)]+\)/, '');
                })
                .get();
              const [title, actualMax, actualAvg, actualLast] = cells;
              const widgetValues = verifyWidgetValues(responsePayload);
              compareWidgetValues(
                {
                  title,
                  max: parseFloat(actualMax),
                  average: parseFloat(actualAvg),
                  last: parseFloat(actualLast),
                },
                widgetValues,
                testData.title
              );
              assertSelections(testData.expectedAggregation);
            });
        });
    });
  });

  it('should apply global refresh button and verify network calls', () => {
    setupMethod();
    cy.wait(7000); //maintaining the wait since page flicker and rendering
    ui.button
      .findByAttribute('aria-label', 'cloudpulse-refresh')
      .should('be.visible')
      .click();
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']).then(
      (interceptions) => {
        const interceptionsArray = Array.isArray(interceptions)
          ? interceptions
          : [interceptions];
        interceptionsArray.forEach((interception) => {
          const { body: requestPayload } = interception.request;
          const { metric, relative_time_duration: timeRange } = requestPayload;
          const metricData = metrics.find((data) => data.name === metric);
          if (!metricData) {
            expect.fail(
              'metricData or its expected properties are not defined.'
            );
          }
          const expectedRelativeTimeDuration = timeRange
            ? `Last ${timeRange.value} ${
                ['hour', 'hr'].includes(timeRange.unit.toLowerCase())
                  ? 'Hours'
                  : timeRange.unit
              }`
            : '';
          expect(metric).to.equal(metricData.name);
          expect(expectedRelativeTimeDuration).to.equal(timeRanges.last24Hours);
        });
      }
    );
  });

  it('should zoom in and out of all the widgets', () => {
    setupMethod();
    metrics.forEach((testData) => {
      cy.wait(7000); //maintaining the wait since page flicker and rendering
      cy.get(`[data-qa-widget="${testData.title}"]`).as('widget');
      cy.get('@widget')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByAttribute('aria-label', 'zoom-in')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.get('@widget').should('be.visible');
          cy.findByTestId('linegraph-wrapper')
            .as('canvas')
            .should('be.visible')
            .find('tbody tr')
            .each(($tr) => {
              const cells = $tr
                .find('td')
                .map((i, el) => Cypress.$(el).text().trim())
                .get();
              const [title, actualMax, actualAvg, actualLast] = cells;
              const widgetValues = verifyWidgetValues(responsePayload);
              compareWidgetValues(
                {
                  title,
                  max: parseFloat(actualMax),
                  average: parseFloat(actualAvg),
                  last: parseFloat(actualLast),
                },
                widgetValues,
                testData.title
              );
            });
          ui.button
            .findByAttribute('aria-label', 'zoom-out')
            .should('be.visible')
            .should('be.enabled')
            .scrollIntoView()
            .click({ force: true });
          cy.get('@widget').should('be.visible');
          cy.findByTestId('linegraph-wrapper')
            .as('canvas')
            .should('be.visible')
            .find('tbody tr')
            .each(($tr) => {
              const cells = $tr
                .find('td')
                .map((i, el) => Cypress.$(el).text().trim())
                .get();
              const [title, actualMax, actualAvg, actualLast] = cells;
              const widgetValues = verifyWidgetValues(responsePayload);
              compareWidgetValues(
                {
                  title,
                  max: parseFloat(actualMax),
                  average: parseFloat(actualAvg),
                  last: parseFloat(actualLast),
                },
                widgetValues,
                testData.title
              );
            });
        });
    });
  });
});
/**
 * `setupMethod` initializes the Cloud Pulse dashboard for testing by performing a series of setup actions.
 * This method mocks user preferences, navigates to the Cloud Pulse page, and configures various settings
 * including service name, time range, engine, region, resource, and node type. It also verifies each selection
 * to ensure the dashboard is correctly configured before running further tests.
 *
 * Steps:
 * 1. Mock user preferences to ensure a consistent test environment.
 * 2. Navigate to the Cloud Pulse page and verify that it has loaded correctly.
 * 3. Select and verify the service name.
 * 4. Set and verify the time range for the dashboard.
 * 5. Select and verify the region.
 * 6. Choose and verify the resource from available widgets.
 */

const setupMethod = () => {
  mockGetUserPreferences({}).as('getUserPreferences');
  cy.visitWithLogin('monitor/cloudpulse');
  selectServiceName(widgetDetails.linode.dashboardName);
  assertSelections(widgetDetails.linode.dashboardName);
  selectTimeRange(timeRanges.last24Hours, Object.values(timeRanges));
  assertSelections(timeRanges.last24Hours);
  ui.regionSelect.find().click().type(`${widgetDetails.linode.region}{enter}`);
  assertSelections(widgetDetails.linode.region);
  selectAndVerifyResource(widgetDetails.linode.resource);
};
/**
 * `verifyWidgetValues` processes and verifies the metric values of a widget from the provided response payload.
 *
 * This method performs the following steps:
 * 1. Transforms the raw data from the response payload into a more manageable format using `transformData`.
 * 2. Extracts key metrics (average, last, and max) from the transformed data using `getMetrics`.
 * 3. Rounds these metrics to two decimal places for accuracy.
 * 4. Returns an object containing the rounded average, last, and max values for further verification or comparison.
 *
 * @param {CloudPulseMetricsResponse} responsePayload - The response payload containing metric data for a widget.
 * @returns {Object} An object with the rounded average, last, and max metric values.
 */
const verifyWidgetValues = (responsePayload: CloudPulseMetricsResponse) => {
  const data = transformData(responsePayload.data.result[0].values, 'Bytes');
  const { average, last, max } = getMetrics(data);
  const roundedAverage = Math.round(average * 100) / 100;
  const roundedLast = Math.round(last * 100) / 100;
  const roundedMax = Math.round(max * 100) / 100;
  return { average: roundedAverage, last: roundedLast, max: roundedMax };
};

/**
 * Compares actual widget values to the expected values and asserts their equality.
 *
 * @param actualValues - The actual values retrieved from the widget, consisting of:
 *   @param actualValues.max - The maximum value shown on the widget.
 *   @param actualValues.average - The average value shown on the widget.
 *   @param actualValues.last - The last or most recent value shown on the widget.
 *
 * @param expectedValues - The expected values that the widget should display, consisting of:
 *   @param expectedValues.max - The expected maximum value.
 *   @param expectedValues.average - The expected average value.
 *   @param expectedValues.last - The expected last or most recent value.
 */

const compareWidgetValues = (
  actualValues: { title: string; max: number; average: number; last: number },
  expectedValues: { max: number; average: number; last: number },
  title: string
) => {
  expect(actualValues.max).to.equal(
    expectedValues.max,
    `Expected ${expectedValues.max} for max, but got ${actualValues.max}`
  );
  expect(actualValues.average).to.equal(
    expectedValues.average,
    `Expected ${expectedValues.average} for average, but got ${actualValues.average}`
  );
  expect(actualValues.last).to.equal(
    expectedValues.last,
    `Expected ${expectedValues.last} for last, but got ${actualValues.last}`
  );
  const extractedTitle = actualValues.title.substring(
    0,
    actualValues.title.indexOf(' ', actualValues.title.indexOf(' ') + 1)
  );
  expect(extractedTitle).to.equal(
    title,
    `Expected ${title} for title ${extractedTitle}`
  );
};
