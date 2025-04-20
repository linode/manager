/* eslint-disable sonarjs/slow-regex */
/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable cypress/unsafe-to-chain-command */

/**
 * @file Integration Tests for CloudPulse Custom and Preset Verification
 */
import { profileFactory, regionFactory } from '@linode/utilities';
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
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetProfile,
  mockGetUserPreferences,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
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

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';
import type { Interception } from 'support/cypress-exports';

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};

const { dashboardName, engine, id, metrics, serviceType } = widgetDetails.dbaas;

const dashboard = dashboardFactory.build({
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
  data: generateRandomMetricsData('Last 24 Hours', '1 hr'),
});

const databaseMock: Database = databaseFactory.build({
  region: mockRegion.label,
  type: engine,
});
const mockProfile = profileFactory.build({
  timezone: 'Etc/GMT',
});

describe('Integration tests for verifying Cloudpulse custom and preset configurations', () => {
  const now = new Date();
  const end = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Adjust to IST
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboards(serviceType, [dashboard]);
    mockGetCloudPulseServices([serviceType]);
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetProfile(mockProfile);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: id,
        engine: engine.toLowerCase(),
        region: mockRegion.id,
        resources: ['1'],
        node_type: 'secondary',
        dateTimeDuration: {
          end: end.toISOString(),
          preset: '24hours',
          start: start.toISOString(),
        },
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
            aggregateFunction: 'min',
          },
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
            aggregateFunction: 'min',
          },
          'Memory Usage': {
            label: 'Memory Usage',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
            aggregateFunction: 'min',
          },
          'Network Traffic': {
            label: 'Network Traffic',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
            aggregateFunction: 'min',
          },
        },
      },
    }).as('fetchPreferences');
    mockGetDatabases([databaseMock]);
    cy.visitWithLogin('/metrics');
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    // validate the API calls are going with intended payload
    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        const {
          metrics: metric,
          relative_time_duration: timeRange,
          entity_ids,
          filters,
          group_by,
        } = requestPayload;
        const metricData = metrics.find(({ name }) => name === metric[0].name);

        if (!metricData) {
          throw new Error(
            `Unexpected metric name '${metric[0].name}' included in the outgoing refresh API request`
          );
        }
        expect(metric[0].name).to.equal(metricData.name);
        expect(metric[0].aggregate_function).to.equal('min');
        expect(timeRange).to.have.property('unit', 'hr');
        expect(timeRange).to.have.property('value', 24);
        expect(entity_ids).to.deep.equal([1]);
        const filtersStr = JSON.stringify(filters);
        expect(filtersStr).to.include('"dimension_label":"node_type"');
        expect(filtersStr).to.include('"operator":"eq"');
        expect(filtersStr).to.include('"value":"secondary"');
        expect(group_by).to.equal('region');
      });
  });

  it('preserves updated global and widget filter values after reloading metrics dashboard', () => {
    cy.visitWithLogin('/linodes');
    ui.nav.findItemByTitle('Metrics').click();
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    cy.wait('@fetchPreferences');
    // validate the API calls are going with intended payload
    // Select a time duration from the autocomplete input.
    ui.autocomplete
      .findByLabel('Time Range')
      .should('be.visible')
      .type('Last 7 Days');

    ui.autocompletePopper
      .findByTitle('Last 7 Days')
      .should('be.visible')
      .click();

    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type('database-1{enter}');

    ui.autocomplete.findByLabel('Database Clusters').click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type('Primary{enter}');

    const interceptedRequests: Interception[] = [];

    cy.get('@getMetrics.all')
      .each((xhr) => {
        // Push each intercepted request into the array
        return interceptedRequests.push(xhr as unknown as Interception);
      })
      .then(() => {
        // Now that all interceptions are captured, get the last 4 calls
        const lastFourCalls = interceptedRequests.slice(-4);

        // Iterate over the last 4 calls
        lastFourCalls.forEach((xhr: unknown) => {
          const interception = xhr as Interception;
          const { body: requestPayload } = interception.request;
          const {
            metrics: metric,
            relative_time_duration: timeRange,
            entity_ids,
            filters,
            group_by,
          } = requestPayload;
          const metricData = metrics.find(
            ({ name }) => name === metric[0].name
          );

          if (!metricData) {
            throw new Error(
              `Unexpected metric name '${metric[0].name}' included in the outgoing refresh API request`
            );
          }
          expect(metric[0].name).to.equal(metricData.name);
          expect(metric[0].aggregate_function).to.equal('min');
          expect(timeRange).to.have.property('unit', 'days');
          expect(timeRange).to.have.property('value', 7);
          expect(entity_ids).to.deep.equal([1]);
          const filtersStr = JSON.stringify(filters);
          expect(filtersStr).to.include('"dimension_label":"node_type"');
          expect(filtersStr).to.include('"operator":"eq"');
          expect(filtersStr).to.include('"value":"primary"');
          expect(group_by).to.equal('region');
        });
      });
  });

  // Define the widget mapping
  const WidgetMap = [
    { title: 'Network Traffic', unit: 'B' },
    { title: 'Memory Usage', unit: 'B' },
    { title: 'CPU Utilization', unit: '%' },
    { title: 'Disk I/O', unit: 'OPS' },
  ];

  it('ensures graph tooltips reflect accurate metric data', () => {
    WidgetMap.forEach(({ title, unit }) => {
      const expectedList: string[] = [];
      const widgetSelector = `[data-qa-widget="${title}"]`;

      // Extract and process expected data
      cy.get('@getMetrics.all').each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { metrics: metric } = interception.request.body;
        const responseData = interception.response?.body;

        if (!responseData?.data?.result?.[0]?.values) {
          cy.log('No values found in response data');
          return;
        }

        const values = responseData.data.result[0].values;

        // Match the metric data with the current widget title
        const metricData = metrics.find(({ name }) => name === metric[0]?.name);
        if (!metricData || metricData.title !== title) return;

        values.forEach(([epoch, value]: [number, string]) => {
          const formattedDate = formatEpochToReadable(epoch);
          expectedList.push(
            `${formattedDate}${title} (${unit})${value} ${unit}`
          );
        });
      });

      // Collect and validate actual data
      const actualList: string[] = [];
      cy.get(widgetSelector)
        .scrollIntoView()
        .within(() => {
          cy.get('circle.recharts-area-dot').each(($dot) => {
            cy.wrap($dot)
              .trigger('mouseover', { force: true })
              .should('have.css', 'opacity', '1')
              .wait(250)
              .get('.recharts-tooltip-wrapper', { timeout: 10000 })
              .should('be.visible')
              .invoke('text')
              .then((text) => actualList.push(text.trim()));
          });
        })
        .then(() => {
          // Compare expected and actual data
          expectedList.forEach((expected, index) => {
            const actual = actualList[index];
            expect(normalizeString(actual)).to.eq(normalizeString(expected));
          });
        });
    });
  });

  // Converts epoch time to a readable format
  function formatEpochToReadable(epoch: number): string {
    return new Date(epoch * 1000)
      .toLocaleString('en-US', {
        timeZone: 'GMT',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\bam\b/gi, 'AM')
      .replace(/\bpm\b/gi, 'PM');
  }

  function normalizeString(str: string): string {
    return str
      .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
      .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letters and numbers
      .replace(/(\b\w{3})\s+(\d)(,)/g, '$1 0$2$3') // Zero-pad single-digit days
      .replace(/(\d):(\d{2})([APM]{2})/g, '0$1:$2 $3') // Zero-pad single-digit hours
      .replace(/\s*,\s*/g, ', ') // Normalize comma spacing
      .replace(
        /(\d+)\.00|(\d+\.\d)0(?!\d)/g,
        (_, intPart, decPart) => intPart || decPart
      ) // Remove trailing .00 or 0 from decimals
      .replace(/\s+/g, ''); // Remove all spaces
  }
});
