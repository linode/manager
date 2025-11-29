/**
 * @file Integration Tests for CloudPulse Firewall Nodebalancer Dashboard.
 */
import { nodeBalancerFactory, regionFactory } from '@linode/utilities';
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
  mockGetFirewall,
  mockGetFirewallDevices,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  firewallFactory,
  flagsFactory,
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
const id = 8;
const { metrics, dashboardName, firewalls, region } =
  widgetDetails.firewall_nodebalancer;
const serviceType = 'firewall';

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find((m) => m.name === metricName);
  if (!metric) return [];

  return metric.filters.map((filter) => ({
    dimension_label: filter.dimension_label,
    label: filter.dimension_label,
    values: filter.value ? [filter.value] : undefined,
  }));
};

const dimensions = [
  {
    label: 'Protocol',
    dimension_label: 'Protocol',
    value: 'temp',
  },
];
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['entity_id'],
  service_type: serviceType,
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      filters: [...dimensions],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      service_type: serviceType,
      group_by: ['entity_id'],
    })
  ),
});

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);
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
        label: firewalls,
        region: 'us-east',
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

const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes', 'Cloud Firewall'],
    id: 'us-east',
    label: 'Newark, NJ',
    monitors: {
      alerts: [],
      metrics: ['Cloud Firewall', 'Linodes'],
    },
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    monitors: {
      alerts: [],
      metrics: ['Linodes'],
    },
  }),
  regionFactory.build({
    capabilities: ['Linodes', 'Cloud Firewall'],
    id: 'br-gru',
    label: 'Sao Paulo, BR',
    country: 'br',
    monitors: {
      alerts: [],
      metrics: ['Linodes', 'Cloud Firewall'],
    },
  }),
];
// ✅ Define mockNodeBalancers first
const mockNodeBalancers = Array.from({ length: 11 }, (_, i) =>
  nodeBalancerFactory.build({
    label: `mockNodeBalancer-resource-${i + 1}`,
    region: i < 10 ? 'us-east' : 'us-ord',
  })
);

// ✅ Now build mockFirewalls using the nodebalancers
const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: firewalls,
    status: 'enabled',
    entities: mockNodeBalancers.map((nb, index) => ({
      id: index + 1,
      label: nb.label,
      type: 'nodebalancer',
      url: '/test',
      parent_entity: null,
    })),
  }),
  firewallFactory.build({
    id: 2,
    label: 'Firewall-1',
    status: 'enabled',
    entities: [
      {
        id: 1,
        label: 'nodebalancer-1',
        type: 'linode_interface',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
  firewallFactory.build({
    id: 3,
    label: 'Firewall-2',
    status: 'enabled',
    entities: [],
  }),
  firewallFactory.build({
    id: 4,
    label: 'Firewall-3',
    status: 'enabled',
    entities: [
      {
        id: 1,
        label: 'linode-1',
        type: 'linode',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
];
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

describe('Integration Tests for firewall Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build({}));
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]);
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(8, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetFirewall(mockFirewalls[0].id, mockFirewalls[0]);
    mockGetFirewalls([mockFirewalls[0]]);
    mockGetFirewallDevices(mockFirewalls[0].id, []);
    mockGetRegions(mockRegions);
    mockGetNodeBalancers(mockNodeBalancers);

    // navigate to the metrics page
    cy.visitWithLogin(`/firewalls/${mockFirewalls[0].id}/metrics`);
    cy.wait('@fetchDashboard');

    // // Select a time duration from the autocomplete input.
    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
    cy.get('@startDateInput').click();
    cy.get('[data-qa-preset="Last day"]').click();
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // Locate the Dashboard Group By button and alias it
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    cy.get('@dashboardGroupByBtn')
      .invoke('attr', 'data-qa-selected')
      .should('eq', 'true');

    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${region}{enter}`);
    cy.findByPlaceholderText('Select NodeBalancers').type(
      'mockNodeBalancer-resource-1{enter}'
    );
    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    cy.get('@getMetrics.all').then((calls) => {
      const lastFour = (calls as unknown as Interception[]).slice(-4);

      expect(lastFour).to.have.length(4);

      lastFour.forEach((interception) => {
        const { body: requestPayload } = interception.request;

        // group_by validation
        expect(requestPayload.group_by).to.have.ordered.members(['entity_id']);
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
    const widgetSelector = '[data-qa-widget="Accepted Bytes"]';

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
      'Accepted Bytes'
    );

    ui.autocomplete
      .findByLabel('Dimensions')
      .should('be.visible')
      .type('IP Version');

    ui.autocompletePopper
      .findByTitle('IP Version')
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
      expect(requestPayload.group_by).to.have.ordered.members(['IP Version']);
      expect(requestPayload.associated_entity_region).to.equal('us-east');
    });
  });
  it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', () => {
    // validate the widget level granularity selection and its metrics
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;

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
