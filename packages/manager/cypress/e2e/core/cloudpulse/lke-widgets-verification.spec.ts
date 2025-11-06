/**
 * @file Integration Tests for CloudPulse LKE Enterprise Dashboard.
 */
import { linodeFactory, regionFactory } from '@linode/utilities';
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
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetClusters } from 'support/intercepts/lke';
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
  kubeLinodeFactory,
  kubernetesClusterFactory,
  widgetFactory,
} from 'src/factories';
import { generateGraphData } from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatToolTip } from 'src/features/CloudPulse/Utils/unitConversion';

import type { CloudPulseMetricsResponse } from '@linode/api-v4';
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
const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, region, resource } = widgetDetails.lke;
const serviceType = 'lke';
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
    label: f.dimension_label,
    values: f.value ? [f.value] : undefined,
  }));
};
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['entity_id'],
  service_type: serviceType,
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) => {
    return widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      filters: [...dimensions],
    });
  }),
});

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);

const mockLinode = linodeFactory.build({
  id: kubeLinodeFactory.build().instance_id ?? undefined,
  label: resource,
  region: 'us-ord',
});

const mockAccount = accountFactory.build();

const mockRegion = regionFactory.build({
  capabilities: ['Kubernetes'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    alerts: ['Kubernetes'],
    metrics: ['Kubernetes'],
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
 * @returns An object containing rounded values for average, last,
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
        label: resource,
        region: 'us-ord',
      },
    ],
    status: 'success',
    unit,
    serviceType,
    groupBy: ['entity_id'],
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
const mockedEnterpriseClusters = [
  kubernetesClusterFactory.build({
    label: resource,
    region: 'us-ord',
    tier: 'enterprise',
  }),
  kubernetesClusterFactory.build({
    label: 'enterprise-cluster-us-east',
    region: 'us-ord',
    tier: 'enterprise',
  }),
  kubernetesClusterFactory.build({
    label: 'enterprise-cluster-eu-ord-1',
    region: 'us-ord',
  }),
  kubernetesClusterFactory.build({
    label: 'enterprise-cluster-eu-west',
    region: 'us-east',
    tier: 'enterprise',
  }),
];

// Tests will be modified
describe('Integration Tests for LKE Enterprise Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetLinodes([mockLinode]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetClusters(mockedEnterpriseClusters);

    mockGetUserPreferences({});

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();
    // Select a time duration from the autocomplete input.
    // Updated selector for MUI x-date-pickers v8 - click on the wrapper div
    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');

    cy.get('@startDateInput').click();

    cy.get('[data-qa-preset="Last day"]').click();

    // Click the "Apply" button to confirm the end date and time
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${region}{enter}`);

    // Select a resource from the autocomplete input.
    // Create an alias for the Clusters autocomplete
    ui.autocomplete
      .findByLabel('Clusters')
      .should('be.visible')
      .as('clusterDropdown');

    cy.get('@clusterDropdown').click();

    cy.get('[data-testid="autocomplete-popper"] li')
      .should('have.length', 3)
      .then(($items) => {
        const texts = Array.from($items).map((el) => el.innerText.trim());
        expect(texts).to.include.members([
          'Select All',
          'enterprise-cluster-us-east',
          'LKE-resource',
        ]);
        // Validate that clusters from other regions or tiers are NOT displayed.
        // This ensures the UI correctly filters out invalid options based on
        // the applied filter criteria — only clusters where:
        //   region === 'us-ord' && tier === 'enterprise'
        // should appear in the dropdown.
        // Any clusters outside this scope (e.g., from 'eu-west' or non-enterprise tiers)
        // must be excluded from the visible list.
        expect(texts).to.not.include('enterprise-cluster-eu-ord-1');
        expect(texts).to.not.include('enterprise-cluster-eu-west');
      });

    // Type and select resource
    cy.get('@clusterDropdown').type(`${resource}{enter}`);

    // Reopen the dropdown if needed
    cy.get('@clusterDropdown').click();

    cy.findByText(resource).should('be.visible');

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');
        cy.get(`[data-qa-value="Clusters ${resource}"]`)
          .should('be.visible')
          .should('have.text', resource);
      });

    // Wait for all metrics query requests to resolve.
    cy.wait([
      '@getMetrics',
      '@getMetrics',
      '@getMetrics',
      '@getMetrics',
      '@getMetrics',
    ]);

    // Scroll to the top of the page to ensure consistent test behavior
    cy.scrollTo('top');
  });
  it('should apply group by at the dashboard level and verify the metrics API calls', () => {
    // Stub metrics API calls for dashboard group by changes
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload, {
      entity_id: '1',
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

    // Verify the drawer body contains "LKE Cluster Status Dashboard"
    cy.get('[data-testid="drawer"]')
      .find('p')
      .first()
      .and('have.text', 'LKE Cluster Status Dashboard');

    // Type "Region" in Dimensions autocomplete field
    ui.autocomplete
      .findByLabel('Dimensions')
      .should('be.visible')
      .type('Region');

    // Select "Region" from the popper options
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
      .should('have.length', 5)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        // Ensure group_by contains entity_id and node_type in correct order
        expect(requestPayload.group_by).to.have.ordered.members([
          'entity_id',
          'region',
        ]);
      });

    // Validate legend rows (post "Group By")
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          cy.get(`[data-qa-graph-row-title="${resource}"]`)
            .should('be.visible')
            .and('have.text', resource);
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
      .should('have.length', 5)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        // Ensure group_by is cleared (null, undefined, or empty array)
        expect(requestPayload.group_by).to.be.oneOf([null, undefined, []]);

        // Scroll to the top of the page to ensure consistent test behavior
        cy.scrollTo('top');
      });
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

            cy.log('expectedWidgetValues ', expectedWidgetValues.max);

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
  it('should trigger the global refresh button and verify the corresponding network calls', () => {
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'refreshMetrics'
    );

    // click the global refresh button
    cy.get('[data-testid="global-refresh"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // validate the API calls are going with intended payload
    cy.get('@refreshMetrics.all')
      .should('have.length', 5)
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
