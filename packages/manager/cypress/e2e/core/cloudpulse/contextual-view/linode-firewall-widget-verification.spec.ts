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
  mockGetFirewall,
  mockGetFirewallDevices,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { randomNumber } from 'support/util/random';

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

import type { CloudPulseMetricsResponse, Filters } from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, firewalls, region } =
  widgetDetails.firewall;
const serviceType = 'firewall';
const dimensions = [
  {
    label: 'VPC-Subnet',
    dimension_label: 'vpc_subnet_id',
  },
  {
    label: 'Interface Type',
    dimension_label: 'interface_type',
  },
  {
    label: 'Interface',
    dimension_label: 'interface_id',
  },
  {
    label: 'Linode',
    dimension_label: 'linode_id',
  },
  {
    label: 'Linode Region',
    dimension_label: 'region_id',
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
    dimensions: dimensions.map((d) => ({
      ...d,
    })),
  })
);

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const findFilter = (filters: Filters[], label: string): Filters | undefined => {
  return filters.find((f) => f.dimension_label === label);
};

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
const mockRegion = regionFactory.build({
  capabilities: ['Linodes', 'Cloud Firewall'],
  id: 'us-east',
  label: 'Newark, NJ',
  monitors: {
    alerts: [],
    metrics: ['Cloud Firewall', 'Linodes'],
  },
});

const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: firewalls,
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
  firewallFactory.build({
    id: 2,
    label: 'firewall-linode_interface-2',
    status: 'enabled',
    entities: [
      {
        id: 2,
        label: 'linode_interface-2',
        type: 'linode_interface',
        url: '/test',
        parent_entity: {
          id: 1,
          label: 'linode-1',
          type: 'linode',
          url: '/parent-test',
          parent_entity: null,
        },
      },
    ],
  }),
  firewallFactory.build({
    id: 3,
    label: 'firewall-no-entities-3',
    status: 'enabled',
    entities: [],
  }),
  firewallFactory.build({
    id: 4,
    label: 'firewall-nodebalancer-4',
    status: 'enabled',
    entities: [
      {
        id: 4,
        label: 'nodebalancer-4',
        type: 'nodebalancer',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
];
describe('Integration Tests for Firewall Dashboard', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build({}));
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]);
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetFirewall(mockFirewalls[0].id, mockFirewalls[0]);
    mockGetFirewalls([mockFirewalls[0]]);
    mockGetFirewallDevices(mockFirewalls[0].id, []);
    mockGetRegions([mockRegion]);

    // navigate to the metrics page
    cy.visitWithLogin(`/firewalls/${mockFirewalls[0].id}/metrics`);
    cy.wait(['@fetchDashboard']);

    // Wait for the services and dashboard API calls to complete before proceeding

    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
    cy.get('@startDateInput').click();
    cy.get('[data-qa-preset="Last day"]').click();
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${region}{enter}`);

    ui.autocomplete.findByLabel('Linode Region').click();

    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    // Assert that the button has attribute data-qa-selected="true"
    cy.get('@dashboardGroupByBtn')
      .invoke('attr', 'data-qa-selected')
      .should('eq', 'true');

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    cy.get('@getMetrics.all').then((calls) => {
      const lastCall = (calls as unknown as Interception[]).slice(-1)[0];
      const filters = lastCall.request.body.filters as Filters[];

      // Collect all dimension labels
      const dimensionLabels = filters.map((f) => f.dimension_label);

      // Check that interface_id and interface_type are NOT in the list
      expect(dimensionLabels).to.not.include('interface_id');
      expect(dimensionLabels).to.not.include('interface_type');
    });
  });

  it('should apply optional filter (InterfaceIds,InterfaceTypes) and verify API request payloads', () => {
    const randomInterfaceids = `${randomNumber(0, 100)},${randomNumber(101, 200)}`;
    cy.findByPlaceholderText('e.g., 1234,5678')
      .should('be.visible')
      .type(randomInterfaceids);

    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    cy.get('@getMetrics.all').then((calls) => {
      const lastFourCalls = (calls as unknown as Interception[]).slice(-4);

      lastFourCalls.forEach((call) => {
        const filters = call.request.body.filters as Filters[];

        const interfaceIdFilter = findFilter(filters, 'interface_id');
        expect(interfaceIdFilter).to.exist;
        expect(interfaceIdFilter?.operator).to.equal('in');
        expect(interfaceIdFilter?.value).to.equal(randomInterfaceids);
      });
    });

    ui.autocomplete
      .findByLabel('Interface Types')
      .should('be.visible')
      .type('VPC{enter}');

    ui.autocomplete.findByLabel('Interface Types').click();

    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    cy.get('@getMetrics.all').then((calls) => {
      const lastCall = (calls as unknown as Interception[]).slice(-1)[0];
      const filters = lastCall.request.body.filters as Filters[];

      const interfaceIdFilter = findFilter(filters, 'interface_id');
      const interfaceTypeFilter = findFilter(filters, 'interface_type');

      expect(interfaceIdFilter).to.exist;
      expect(interfaceIdFilter?.operator).to.equal('in');
      expect(interfaceIdFilter?.value).to.equal(randomInterfaceids);

      expect(interfaceTypeFilter).to.exist;
      expect(interfaceTypeFilter?.operator).to.equal('in');
      expect(interfaceTypeFilter?.value).to.include('vpc');
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
