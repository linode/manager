/**
 * @file Integration Tests for CloudPulse Volume(Blockstorage) Dashboard – Refactored & Stable
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
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolume, mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  flagsFactory,
  volumeFactory,
  widgetFactory,
} from 'src/factories';
import { generateGraphData } from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatToolTip } from 'src/features/CloudPulse/Utils/unitConversion';

import type { CloudPulseMetricsResponse } from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

const expectedGranularityArray = ['Auto', '1 day', '1 hr'];
const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics } = widgetDetails.blockstorage;

const serviceType = 'blockstorage';
const capabilities = 'Block Storage';

const dimensions = [
  { label: 'Region', dimension_label: 'region', value: 'us-ord' },
];

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

// Dashboard + Metric Definitions
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
      namespace_id: id,
      service_type: serviceType,
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

const mockRegions = [
  regionFactory.build({
    capabilities: [capabilities],
    id: 'us-ord',
    label: 'Chicago, IL',
    monitors: { metrics: [capabilities], alerts: [] },
  }),
];

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockVolumesEncrypted = [
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord',
    region: 'us-ord',
  }),
];

/** Extract expected Avg/Max/Last for comparison */
const getExpectedLegendValues = (
  response: CloudPulseMetricsResponse,
  label: string,
  unit: string
) => {
  const graphData = generateGraphData({
    label,
    metricsList: response,
    resources: [{ id: '1', label: 'us-ord-1', region: 'us-ord' }],
    status: 'success',
    unit,
    serviceType,
    groupBy: ['entity_id'],
  });

  const { average, last, max } = graphData.legendRowsData[0].data;

  return {
    average: formatToolTip(average, unit),
    last: formatToolTip(last, unit),
    max: formatToolTip(max, unit),
  };
};

/** Assert values inside a widget */
const assertLegendValues = (testData: {
  expectedAggregation?: string;
  expectedAggregationArray?: string[];
  expectedGranularity?: string;
  filters?: { dimension_label: string; operator: string; value: null }[];
  name?: string;
  title: string;
  unit: string;
  yLabel?: string;
}) => {
  const expected = getExpectedLegendValues(
    metricsAPIResponsePayload,
    testData.title,
    testData.unit
  );

  cy.get('.recharts-responsive-container').within(() => {
    cy.get(`[data-qa-graph-row-title="${testData.title}"]`).should(
      'have.text',
      testData.title
    );

    cy.get('[data-qa-graph-column-title="Max"]').should(
      'have.text',
      expected.max
    );
    cy.get('[data-qa-graph-column-title="Avg"]').should(
      'have.text',
      expected.average
    );
    cy.get('[data-qa-graph-column-title="Last"]').should(
      'have.text',
      expected.last
    );
  });
};

/** Open Global Group-By Drawer */
const openGlobalGroupBy = () => {
  ui.button
    .findByAttribute('aria-label', 'Group By Dashboard Metrics')
    .first()
    .scrollIntoView()
    .click();
};

/** Clear all group-by selections */
const clearGroupBy = () => {
  cy.get('[data-qa-autocomplete="Dimensions"]')
    .find('button[aria-label="Clear"]')
    .click();
};

describe('CloudPulse Blockstorage Dashboard – Refactored', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build());
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'initialMetrics'
    );

    mockGetRegions(mockRegions);
    mockGetVolume(mockVolumesEncrypted[0]);
    mockGetVolumes(mockVolumesEncrypted);

    cy.visitWithLogin('/volumes/1/metrics');

    // select date range
    cy.get('[aria-labelledby="start-date"]').parent().click();
    cy.get('[data-qa-preset="Last day"]').click();
    cy.get('[data-qa-buttons="apply"]').should('be.visible').click();

    cy.wait('@initialMetrics').its('response.statusCode').should('eq', 200);
  });

  it('applies Group By at dashboard level and validates API', () => {
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload, {
      entity_id: '1',
    }).as('refreshMetrics');

    openGlobalGroupBy();

    ui.autocomplete.findByLabel('Dimensions').type('Region');
    ui.autocompletePopper.findByTitle('Region').click();

    cy.get('body').type('{esc}');
    cy.findByTestId('apply').click();

    cy.get('@refreshMetrics.all')
      .should('have.length', 6)
      .each((interception: Interception) => {
        expect(interception.request.body.group_by).to.deep.equal([
          'entity_id',
          'region',
        ]);
      });
  });
  it('should clear all Group By selections', () => {
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'refreshMetrics'
    );

    openGlobalGroupBy();
    clearGroupBy();
    cy.findByTestId('apply').click();

    cy.get('@refreshMetrics.all').each((interception: Interception) => {
      expect(interception.request.body.group_by).to.be.oneOf([
        null,
        undefined,
        [],
      ]);
    });
  });

  it('applies widget-level Group By and validates API payload', () => {
    const widgetSelector = '[data-qa-widget="Volume Read Operations"]';

    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'widgetGroupBy'
    );

    cy.get(widgetSelector).within(() => {
      ui.button
        .findByAttribute('aria-label', 'Group By Dashboard Metrics')
        .as('widgetGroupBtn')
        .scrollIntoView()
        .click();
    });

    cy.get('[data-testid="drawer-title"]').should('have.text', 'Group By');
    cy.get('[data-qa-id="groupby-drawer-subtitle"]').should(
      'have.text',
      'Volume Read Operations'
    );

    ui.autocomplete.findByLabel('Dimensions').type('response_type');
    ui.autocompletePopper.findByTitle('response_type').click();

    cy.get('body').type('{esc}');
    cy.findByTestId('apply').click();

    cy.wait('@widgetGroupBy').then((interception: Interception) => {
      expect(interception.request.body.group_by).to.have.ordered.members([
        'entity_id',
        'response_type',
      ]);
    });
  });

  it('updates graph values when granularity changes', () => {
    metrics.forEach((testData) => {
      mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
        'granularity'
      );

      const widget = `[data-qa-widget="${testData.title}"]`;

      cy.get(widget).within(() => {
        ui.autocomplete.findByLabel('Select an Interval').click();

        expectedGranularityArray.forEach((opt) =>
          ui.autocompletePopper.findByTitle(opt).should('exist')
        );

        ui.autocomplete
          .findByLabel('Select an Interval')
          .type(`${testData.expectedGranularity}{enter}`);

        assertLegendValues(testData);
      });
    });
  });

  it('updates graph values when aggregation changes', () => {
    metrics.forEach((testData) => {
      mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
        'agg'
      );

      const widget = `[data-qa-widget="${testData.title}"]`;

      cy.get(widget).within(() => {
        ui.autocomplete
          .findByLabel('Select an Aggregate Function')
          .type(`${testData.expectedAggregation}{enter}`);

        cy.wait('@agg').then((i: Interception) => {
          expect(i.request.body.metrics[0].aggregate_function).to.eq(
            testData.expectedAggregation
          );
        });

        assertLegendValues(testData);
      });
    });
  });

  it('zooms in and out on all widgets', () => {
    metrics.forEach((testData) => {
      const widget = `[data-qa-widget="${testData.title}"]`;

      cy.get(widget).within(() => {
        ui.button.findByAttribute('aria-label', 'Zoom Out').click();
        assertLegendValues(testData);

        ui.button
          .findByAttribute('aria-label', 'Zoom In')
          .click({ force: true });
        assertLegendValues(testData);
      });
    });
  });
});
