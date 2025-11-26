/**
 * @file Integration Tests for CloudPulse Object Storage  By Endpoint Dashboard.
 */
import { regionFactory } from '@linode/utilities';
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
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetBuckets,
  mockGetObjectStorageEndpoints,
} from 'support/intercepts/object-storage';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  flagsFactory,
  objectStorageBucketFactory,
  objectStorageEndpointsFactory,
  widgetFactory,
} from 'src/factories';
import { generateGraphData } from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatToolTip } from 'src/features/CloudPulse/Utils/unitConversion';

import type {
  CloudPulseMetricsResponse,
  CloudPulseServiceType,
  Dashboard,
  ObjectStorageEndpoint,
} from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

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
const expectedGranularityArray = ['Auto', '1 day', '1 hr'];
const timeDurationToSelect = 'Last 24 Hours';
const {metrics, serviceType } = widgetDetails.objectstorage;
const id=10;
const dashboardName='object storageby endpoint dashboard';

// Build a shared dimension object
const dimensions = [
  {
    label: 'Region',
    dimension_label: 'region',
    value: 'us-ord',
  },
];

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find((m) => m.name === metricName);
  if (!metric) return [];

  return metric.filters.map((f) => ({
    dimension_label: f.dimension_label,
    label: f.dimension_label, // or friendly name
    values: f.value ? [f.value] : undefined,
  }));
};

// Dashboard creation
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['endpoint'],
  service_type: serviceType as CloudPulseServiceType,
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      filters: [...dimensions],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      namespace_id: id,
      service_type: serviceType as CloudPulseServiceType,
    })
  ),
});

// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);

const mockRegion = regionFactory.build({
  capabilities: ['Object Storage'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    metrics: ['Object Storage'],
    alerts: [],
  },
});
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
        label: 'us-ord-1',
        region: 'us-ord',
      },
    ],
    status: 'success',
    unit,
    serviceType: serviceType as CloudPulseServiceType,
    groupBy: ['endpoint'],
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

describe('Integration Tests for Object Storage Dashboard ', () => {
  /**
   * Integration Tests for  Object Storage Dashboard
   *
   * This suite validates end-to-end functionality of the CloudPulse  Object Storage Dashboard.
   * It covers:
   * - Loading and rendering of widgets with correct filters.
   * - Applying, clearing, and verifying "Group By" at dashboard and widget levels.
   * - Selecting time ranges, granularities, and aggregation functions.
   * - Triggering dashboard refresh and validating API calls.
   * - Performing widget interactions (zoom in/out) and verifying graph data.
   *
   * Actions focus on user flows (selecting dashboards, filters, group by, zoom, etc.)
   * and Verifications ensure correct API payloads, widget states, applied filters,
   * and accurate graph/legend values.
   */
  afterEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  const bucketMock = [
    objectStorageBucketFactory.build({
      cluster: 'us-ord-1',
      hostname: 'bucket-1.us-ord-1.linodeobjects.com',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-1.linodeobjects.com',
      label: 'bucket-1',
      endpoint_type: 'E1',
    }),
    objectStorageBucketFactory.build({
      cluster: 'us-ord-2',
      hostname: 'bucket-2.us-ord-2.linodeobjects.com',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-2.linodeobjects.com',
      label: 'bucket-2',
      endpoint_type: 'E2',
    }),
    objectStorageBucketFactory.build({
      cluster: 'us-ord-3',
      hostname: 'bucket-3.us-ord-3.linodeobjects.com',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E3-us-sea-3.linodeobjects.com',
      label: 'bucket-3',
      endpoint_type: 'E3',
    }),
    objectStorageBucketFactory.build({
      cluster: 'us-ord-4',
      hostname: 'bucket-4.us-ord-4.linodeobjects.com',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-4.linodeobjects.com',
      label: 'bucket-4',
      endpoint_type: 'E2',
    }),
    objectStorageBucketFactory.build({
      cluster: 'us-ord-5',
      hostname: 'bucket-5.us-ord-5.linodeobjects.com',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E0-us-sea-5.linodeobjects.com',
      label: 'bucket-5',
      endpoint_type: 'E0',
    }),
  ];

  const mockEndpoints: ObjectStorageEndpoint[] = [
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E2',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-1.linodeobjects.com',
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E2',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-2.linodeobjects.com',
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E1',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E1-us-sea-5.linodeobjects.com',
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E2',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E2-us-sea-3.linodeobjects.com',
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E3',
      region: mockRegion.id,
      s3_endpoint: 'endpoint_type-E3-us-sea-4.linodeobjects.com',
    }),
  ];

  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockGetBuckets(bucketMock).as('getBuckets');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices']);
    cy.wait('@fetchDashboard').then((interception: Interception) => {
      const dashboards = interception.response?.body?.data as Dashboard[];
      const dashboard = dashboards[0];
      expect(dashboard.widgets).to.have.length(4);
    });

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

      cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
      cy.get('@startDateInput').click();
      cy.get(`[data-qa-preset="Last day"]`).click();
      cy.get('[data-qa-buttons="apply"]')
        .should('be.visible')
        .should('be.enabled')
        .click();

    //  Select a region from the dropdown.

    ui.regionSelect.find().clear();
    ui.regionSelect.find().click();
    cy.focused().type(`${mockRegion.label}{enter}`);

    ui.autocomplete
      .findByLabel('Endpoints')
      .should('be.visible')
      .type('endpoint_type-E2-us-sea-2.linodeobjects.com{enter}');

    ui.autocomplete.findByLabel('Endpoints').click();

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
  });
  it('should apply group by at the dashboard level and verify the metrics API calls', () => {
    // Stub metrics API calls for dashboard group by changes
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload, {
      endpoint: 'endpoint_type-E3-us-sea-3.linodeobjects.com',
    }).as('refreshMetrics');

    // Validate legend rows (pre "Group By")
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          const graphRowTitle = `[data-qa-graph-row-title="${testData.title}"]`;
          cy.get(graphRowTitle)
            .should('be.visible')
            .and('have.text', `${testData.title}`);
        });
    });

    // Locate the Dashboard Group By button and alias it
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    // Ensure the button is scrolled into view
    cy.get('@dashboardGroupByBtn').scrollIntoView();

    // Verify tooltip "Group By" is present
    ui.tooltip.findByText('Group By');

    // Assert that the button has attribute data-qa-selected="true"
    cy.get('@dashboardGroupByBtn')
      .invoke('attr', 'data-qa-selected')
      .should('eq', 'true');

    // Click the Group By button to open the drawer
    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    // Verify the drawer title is "Global Group By"
    cy.get('[data-testid="drawer-title"]')
      .should('be.visible')
      .and('have.text', 'Global Group By');

    // Verify the drawer body contains "Object Storage Dashboard"
    cy.get('[data-testid="drawer"]')
      .find('p')
      .first()
      .and('have.text', dashboardName);

    ui.autocomplete
      .findByLabel('Dimensions')
      .should('be.visible')
      .type('Region');

    // Select "Node Type" from the popper options
    ui.autocompletePopper.findByTitle('Region').should('be.visible').click();

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();

    // Verify the Group By button reflects the selection
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('have.attr', 'aria-label', 'Group By Dashboard Metrics')
      .and('have.attr', 'data-qa-selected', 'true');

    // Validate all intercepted metrics API calls contain correct filters and group_by values
    cy.get('@refreshMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        // Ensure group_by contains entity_id and node_type in correct order
        expect(requestPayload.group_by).to.have.ordered.members([
          'endpoint',
          'region',
        ]);
      });

    // Validate legend rows (post "Group By")
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          cy.get('[data-qa-graph-row-title="endpoint_type-E3-us-sea-3.linodeobjects.com"]')
            .should('be.visible')
            .and('have.text', 'endpoint_type-E3-us-sea-3.linodeobjects.com');
        });
    });
  });

  it('should unselect all group bys and verify the metrics API calls', () => {
    // Stub metrics API calls for dashboard group by changes
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'refreshMetrics'
    );

    // Locate the Dashboard Group By button and alias it
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    // Ensure the button is scrolled into view
    cy.get('@dashboardGroupByBtn').scrollIntoView();

    // Click the Group By button to open the drawer
    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    // Inside Dimensions field, click the Clear button to remove all group by selections
    cy.get('[data-qa-autocomplete="Dimensions"]').within(() => {
      cy.get('button[aria-label="Clear"]').should('be.visible').click({});
    });

    // Click Apply to confirm unselection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();

    // Verify the Group By button now has data-qa-selected="false"
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .and('have.attr', 'data-qa-selected', 'false');

    // Validate all intercepted metrics API calls contain no group_by values
    cy.get('@refreshMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        // Ensure group_by is cleared (null, undefined, or empty array)
        expect(requestPayload.group_by).to.be.oneOf([null, undefined, []]);
      });
    // Validate legend rows (post "Group By")
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          cy.get(`[data-qa-graph-row-title="${testData.title}"]`)
            .should('be.visible')
            .and('have.text', testData.title);
        });
    });
  });

  it('should apply group by at widget level only  and verify the metrics API calls', () => {
    // validate the widget level granularity selection and its metrics
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    cy.get('@dashboardGroupByBtn').scrollIntoView();

    // Use the alias safely
    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    cy.get('[data-qa-autocomplete="Dimensions"]').within(() => {
      cy.get('button[aria-label="Clear"]').should('be.visible').click({});
    });

    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();
    const widgetSelector = '[data-qa-widget="Total Bucket Size"]';

    cy.get(widgetSelector)
      .should('be.visible')
      .within(() => {
        // Create alias for the group by button
        ui.button
          .findByAttribute('aria-label', 'Group By Dashboard Metrics')
          .as('groupByButton'); // alias

        cy.get('@groupByButton').scrollIntoView();

        // Click the button
        cy.get('@groupByButton').should('be.visible').click();
      });

    cy.get('[data-testid="drawer-title"]')
      .should('be.visible')
      .and('have.text', 'Group By');

    cy.get('[data-qa-id="groupby-drawer-subtitle"]').and(
      'have.text',
      'Total Bucket Size'
    );

    ui.autocomplete
      .findByLabel('Dimensions')
      .should('be.visible')
      .type('request_type');

    ui.autocompletePopper
      .findByTitle('request_type')
      .should('be.visible')
      .click();

    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getGroupBy'
    );

    cy.get('body').type('{esc}');
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();

    // Verify data-qa-selected attribute
    cy.get('@groupByButton')
      .invoke('attr', 'data-qa-selected')
      .should('eq', 'true');

    cy.wait('@getGroupBy').then((interception: Interception) => {
      const { body: requestPayload } = interception.request;
      expect(requestPayload.group_by).to.have.ordered.members(['request_type']);
    });
  });

  it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', () => {
    // validate the widget level granularity selection and its metrics
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .find('h2')
        .should('have.text', `${testData.title} (${testData.unit})`);
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          // check for all available granularity in popper
          ui.autocomplete
            .findByLabel('Select an Interval')
            .should('be.visible')
            .click();

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
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title}"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title}`);

            cy.get('[data-qa-graph-column-title="Max"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get('[data-qa-graph-column-title="Avg"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get('[data-qa-graph-column-title="Last"]')
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

          // check if the API call is made correctly with time granularity value selected
          cy.wait('@getAggregationMetrics').then((interception) => {
            expect(interception)
              .to.have.property('response')
              .with.property('statusCode', 200);
            expect(testData.expectedAggregation).to.equal(
              interception.request.body.metrics[0].aggregate_function
            );
          });

          // validate the widget areachart is present
          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title}"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title}`);

            cy.get('[data-qa-graph-column-title="Max"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get('[data-qa-graph-column-title="Avg"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get('[data-qa-graph-column-title="Last"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });
        });
    });
  });
  it('should trigger the global refresh button and verify the corresponding network calls', () => {
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'refreshMetrics'
    );

    // click the global refresh button
    ui.button
      .findByAttribute('aria-label', 'Refresh Dashboard Metrics')
      .should('be.visible')
      .click();

    // validate the API calls are going with intended payload
    cy.get('@refreshMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        const { metrics: metric, relative_time_duration: timeRange } =
          requestPayload;
        const metricData = metrics.find(({ name }) => name === metric[0].name);

        if (!metricData) {
          throw new Error(
            `Unexpected metric name '${metric[0].name}' included in the outgoing refresh API request`
          );
        }
        expect(metric[0].name).to.equal(metricData.name);
        expect(timeRange).to.have.property('unit', 'days');
        expect(timeRange).to.have.property('value', 1);
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
          cy.get('@widget').should('be.visible');

          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title}"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title}`);

            cy.get('[data-qa-graph-column-title="Max"]')
              .should('be.visible')
              .should('have.text', expectedWidgetValues.max);

            cy.get('[data-qa-graph-column-title="Avg"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get('[data-qa-graph-column-title="Last"]')
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
          cy.get('@widget').should('be.visible');
          cy.get('.recharts-responsive-container').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload,
              testData.title,
              testData.unit
            );
            const graphRowTitle = `[data-qa-graph-row-title="${testData.title}"]`;
            cy.get(graphRowTitle)
              .should('be.visible')
              .should('have.text', `${testData.title}`);

            cy.get('[data-qa-graph-column-title="Max"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.max}`);

            cy.get('[data-qa-graph-column-title="Avg"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.average}`);

            cy.get('[data-qa-graph-column-title="Last"]')
              .should('be.visible')
              .should('have.text', `${expectedWidgetValues.last}`);
          });
        });
    });
  });
});
