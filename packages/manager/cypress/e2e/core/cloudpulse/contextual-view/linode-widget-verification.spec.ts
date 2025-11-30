/**
 * @file Integration Tests for CloudPulse Linode Dashboard.
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
import { mockGetLinode, mockGetLinodes } from 'support/intercepts/linodes';
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
  widgetFactory,
} from 'src/factories';
import { generateGraphData } from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatToolTip } from 'src/features/CloudPulse/Utils/unitConversion';

import type { CloudPulseMetricsResponse } from '@linode/api-v4';

const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, resource } = widgetDetails.linode;
const serviceType = 'linode';
const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  id,
  group_by: ['entity_id'],
  widgets: metrics.map(({ name, title, unit, yLabel }) => {
    return widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      group_by: ['entity_id'],
    });
  }),
});

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);

const mockLinode = linodeFactory.build({
  id: kubeLinodeFactory.build().instance_id ?? undefined,
  label: resource,
  tags: ['tag-2', 'tag-3'],
  region: 'us-ord',
});

const mockAccount = accountFactory.build();

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

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
const mockRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    alerts: [],
    metrics: ['Linodes'],
  },
});

describe('Integration Tests for Linode Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetLinodes([mockLinode]);
    mockGetLinode(mockLinode.id, mockLinode);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockGetRegions([mockRegion]);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    // navigate to the metrics page
    cy.visitWithLogin(`/linodes/${mockLinode.id}/metrics`);

    cy.get('button[data-testid="button"]').then(($btn) => {
      if ($btn.text().trim() === 'Switch to legacy Metrics') {
        cy.wrap($btn).click();
      }
    });
    cy.get('[role="tablist"]').within(() => {
      cy.get('[data-testid="Metrics"]')
        .should('have.attr', 'aria-label', 'Metrics ')
        .find('[data-testid="betaChip"] span')
        .should('have.text', 'beta');
    });

    cy.wait('@fetchDashboard');

    // Select a time duration from the autocomplete input.
    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');

    cy.get('@startDateInput').click();

    cy.get('[data-qa-preset="Last day"]').click();

    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .invoke('attr', 'data-qa-selected')
      .should('eq', 'true');
    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    // Scroll to the top of the page to ensure consistent test behavior
    cy.scrollTo('top');
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
