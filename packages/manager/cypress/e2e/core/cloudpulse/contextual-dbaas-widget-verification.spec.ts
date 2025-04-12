/**
 * @file Integration Tests for contextualview of Dbass Dashboard.
 */
import { mockDatabaseNodeTypes } from 'support/constants/databases';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateCloudPulseJWEToken,
  mockCreateCloudPulseMetrics,
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import {
  mockGetDatabase,
  mockGetDatabaseTypes,
} from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  widgetFactory,
} from 'src/factories';
import { generateGraphData } from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatToolTip } from 'src/features/CloudPulse/Utils/unitConversion';

import type { CloudPulseMetricsResponse, Database } from '@linode/api-v4';

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
const expectedGranularityArray = ['1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';

const {
  clusterName,
  dashboardName,
  engine,
  metrics,
  region,
  serviceType,
} = widgetDetails.dbaas;

const dashboard = dashboardFactory.build({
  id: 1,
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ name, title, unit, yLabel }) => {
    return widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
    });
  }),
});

const metricDefinitions = {
  data: metrics.map(({ name, title, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
    })
  ),
};

const mockAccount = accountFactory.build();

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

/**
 * Generates graph data from a given CloudPulse metrics response and
 * extracts average, last, and maximum metric values from the first
 * legend row. The values are rounded to two decimal places for
 * better readability.
 *
 * @param responsePayload - The metrics response object containing
 *                          the necessary data for graph generation.
 * @param label - The label for the graph, used for display purposes.
 *
 * @returns An object containing rounded values for max average, last,
 *
 */

const getWidgetLegendRowValuesFromResponse = (
  responsePayload: CloudPulseMetricsResponse,
  label: string,
  unit: string
) => {
  // Generate graph data using the provided parameters
  const graphData = generateGraphData({
    label,
    metricsList: responsePayload,
    resources: [
      {
        id: '1',
        label: clusterName,
        region: 'us-ord',
      },
    ],
    status: 'success',
    unit,
  });

  // Destructure metrics data from the first legend row
  const { average, last, max } = graphData.legendRowsData[0].data;

  // Round the metrics values to two decimal places
  const roundedAverage = formatToolTip(average, unit);
  const roundedLast = formatToolTip(last, unit);
  const roundedMax = formatToolTip(max, unit);
  // Return the rounded values in an object
  return { average: roundedAverage, last: roundedLast, max: roundedMax };
};

const databaseMock: Database = databaseFactory.build({
  cluster_size: 3,
  engine: 'mysql',
  id: 100,
  label: clusterName,
  region,
  status: 'active',
  type: engine,
});

describe('Integration Tests for DBaaS Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboard(1, dashboard).as('getDashboard');
    mockCreateCloudPulseJWEToken(serviceType).as('getServiceType');
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetDatabase(databaseMock).as('getDatabase');
    mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');

    // navigate to the linodes page
    cy.visitWithLogin('/linodes');

    // navigate to the Databases
    cy.get('[data-testid="menu-item-Databases"]').should('be.visible').click();

    // navigate to the Monitor
    cy.visitWithLogin(
      `/databases/${databaseMock.engine}/${databaseMock.id}/monitor`
    );

    cy.wait(['@getDashboard', '@getServiceType', '@getDatabase']);

    // Use findByPlaceholderText to locate the input field
    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled') // Check if disabled
      .and('have.value', 'Dbaas Dashboard'); // Ensure value is set

    // Select a time duration from the autocomplete input.
    ui.autocomplete
      .findByLabel('Time Range')
      .should('be.visible')
      .type(timeDurationToSelect);

    ui.autocompletePopper
      .findByTitle(timeDurationToSelect)
      .should('be.visible')
      .click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type('Primary{enter}');

    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Node Type Primary"]`)
        .should('be.visible')
        .should('have.text', 'Primary');
    });

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
  });

  it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', () => {
    // validate the widget level granularity selection and its metrics
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .find('h2')
        .should('have.text', `${testData.title} (${testData.unit.trim()})`);
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          // check for all available granularity in popper
          ui.autocomplete
            .findByLabel('Select an Interval')
            .should('be.visible')
            .click();

          // Verify tooltip message for granularity selection

          ui.tooltip
            .findByText('Data aggregation interval')
            .should('be.visible');

          expectedGranularityArray.forEach((option) => {
            ui.autocompletePopper.findByTitle(option).should('exist');
          });

          mockCreateCloudPulseMetrics(
            serviceType,
            metricsAPIResponsePayload
          ).as('getGranularityMetrics');

          // find the interval component and select the expected granularity
          ui.autocomplete
            .findByLabel('Select an Interval')
            .should('be.visible')
            .type(`${testData.expectedGranularity}{enter}`); // type expected granularity

          // check if the API call is made correctly with time granularity value selected
          cy.wait('@getGranularityMetrics').then((interception) => {
            expect(interception)
              .to.have.property('response')
              .with.property('statusCode', 200);
            expect(testData.expectedGranularity).to.include(
              interception.request.body.time_granularity.value
            );
          });

          // validate the widget areachart is present
          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title} (${testData.unit})"]`;

            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title} (${testData.unit})`);

            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });
        });
    });
  });

  it('should allow users to select the desired aggregation and view the latest data from the API displayed in the graph', () => {
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          mockCreateCloudPulseMetrics(
            serviceType,
            metricsAPIResponsePayload
          ).as('getAggregationMetrics');

          // find the interval component and select the expected granularity
          ui.autocomplete
            .findByLabel('Select an Aggregate Function')
            .should('be.visible')
            .type(`${testData.expectedAggregation}{enter}`); // type expected granularity

          // Verify tooltip message for aggregation selection

          ui.tooltip.findByText('Aggregation function').should('be.visible');

          // check if the API call is made correctly with time granularity value selected
          cy.wait('@getAggregationMetrics').then((interception) => {
            expect(interception)
              .to.have.property('response')
              .with.property('statusCode', 200);
            expect(testData.expectedAggregation).to.equal(
              interception.request.body.aggregate_function
            );
          });

          // validate the widget areachart is present
          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title} (${testData.unit})"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title} (${testData.unit})`);

            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });
        });
    });
  });

  it('should zoom in and out of all the widgets', () => {
    // do zoom in and zoom out test on all the widgets
    metrics.forEach((testData) => {
      cy.get(`[data-qa-widget="${testData.title}"]`).as('widget');
      cy.get('@widget')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByAttribute('aria-label', 'Zoom Out')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Verify tooltip message for Zoom-in

          ui.tooltip.findByText('Maximize').should('be.visible');

          cy.get('@widget').should('be.visible');

          // validate the widget areachart is present
          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );

            const graphRowTitle = `[data-qa-graph-row-title="${testData.title} (${testData.unit})"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title} (${testData.unit})`);

            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });

          // click zoom out and validate the same
          ui.button
            .findByAttribute('aria-label', 'Zoom In')
            .should('be.visible')
            .should('be.enabled')
            .scrollIntoView()
            .click({ force: true });

          // Verify tooltip message for Zoom-out

          ui.tooltip.findByText('Minimize').should('be.visible');

          cy.get('@widget').should('be.visible');

          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title} (${testData.unit})"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title} (${testData.unit})`);

            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });
        });
    });
  });
});
