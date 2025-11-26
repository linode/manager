/**
 * @file Integration Tests for CloudPulse Object Storage Endpoint Dashboard.
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
import {
  comparePreferences,
  generateRandomMetricsData,
} from 'support/util/cloudpulse';
import { apiMatcher } from 'support/util/intercepts';

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

import type { ObjectStorageEndpoint } from '@linode/api-v4';

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

  return metric.filters.map((filter) => ({
    dimension_label: filter.dimension_label,
    label: filter.dimension_label, // or friendly name
    values: filter.value ? [filter.value] : undefined,
  }));
};

// Dashboard creation
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['endpoint'],
  service_type: 'objectstorage',
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      filters: [
        {
          operator: 'eq',
          dimension_label: 'Protocol',
          value: 'list protocols',
        },
      ],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      namespace_id: id,
      service_type: 'objectstorage',
    })
  ),
});
// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: `${title} (object_storage)`,
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

describe('Integration Tests for Object Storage Endpoint Dashboard ', () => {
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
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 10,
        groupBy: ['region', 'endpoint'],
        widgets: {
          'Total Bucket Size': {
            label: 'Total Bucket Size',
            timeGranularity: {
              unit: 'min',
              value: 5,
            },
          },
        },
        region: 'us-ord',
        endpoint: ['endpoint_type-E2-us-sea-2.linodeobjects.com'],
      },
    }).as('fetchPreferences');

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchPreferences']);

    ui.button.findByTitle('Filters').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]')
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get(
          '[data-qa-value="Endpoints endpoint_type-E2-us-sea-2.linodeobjects.com"]'
        )
          .should('be.visible')
          .should('have.text', 'endpoint_type-E2-us-sea-2.linodeobjects.com');

      });

    ui.button.findByTitle('Filters').click();
    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    // Scroll to the top of the page to ensure consistent test behavior
    cy.scrollTo('top');
  });

  it('reloads the page and verifies preferences are restored from API', () => {
    cy.intercept('GET', apiMatcher('profile/preferences')).as(
      'fetchPreferencesReload'
    );
    // On page refresh, the second API call for buckets returns null, so we are mocking it to ensure consistent responses.
    mockGetBuckets(bucketMock).as('getBuckets');

    cy.reload();
    cy.wait('@fetchPreferencesReload');
    cy.get('[data-qa-paper="true"]').within(() => {
      // Dashboard autocomplete
      cy.get(
        '[data-qa-autocomplete="Dashboard"] input[data-testid="textfield-input"]'
      ).should('have.value', dashboardName);

      // Region autocomplete
      cy.get(
        '[data-qa-autocomplete="Region"] input[data-testid="textfield-input"]'
      ).should('have.value', 'US, Chicago, IL (us-ord)');

      // Endpoints
      ui.autocomplete
        .findByLabel('Endpoints')
        .parent() // wrapper containing chips
        .find('[role="button"][data-tag-index="0"]') // select the inner span only
        .should('have.text', 'endpoint_type-E2-us-sea-2.linodeobjects.com');

      // Refresh button (tooltip)
      cy.get('[data-qa-tooltip="Refresh"]').should('exist');

      // Group By button
      cy.get('[data-testid="group-by"]').should(
        'have.attr',
        'data-qa-selected',
        'true'
      );
    });

    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
    cy.get('@startDateInput').click();
    cy.get('button[data-qa-preset="Last day"]')
      .should('be.visible')
      .and('have.text', 'Last day');

    ui.buttonGroup
      .findButtonByTitle('Cancel')
      .should('be.visible')
      .and('be.enabled')
      .click();
  });
  it('clears the Dashboard filters and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDashbaordPreference'
    );
    // clear Dashboard filter
    cy.get('[data-qa-autocomplete="Dashboard"]')
      .find('button[aria-label="Clear"]')
      .click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').should('not.exist');
    cy.wait('@updateDashbaordPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = { widgets: {} };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Region filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]').should('not.exist');

        cy.get(
          '[data-qa-value="Endpoints endpoint_type-E2-us-sea-2.linodeobjects.com"]'
        ).should('not.exist');

      });

    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 10,
        groupBy: ['region', 'endpoint'],
        widgets: {
          'Total Bucket Size': {
            label: 'Total Bucket Size',
            timeGranularity: {
              unit: 'min',
              value: 5,
            },
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the EndPoint filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Endpoints"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]').should('be.visible');

        cy.get(
          '[data-qa-value="Endpoints endpoint_type-E2-us-sea-2.linodeobjects.com"]'
        ).should('not.exist');
      });

    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 10,
        groupBy: ['region', 'endpoint'],
        region: 'us-ord',
        resources: [],
        endpoint: [],
        widgets: {
          'Total Bucket Size': {
            label: 'Total Bucket Size',
            timeGranularity: {
              unit: 'min',
              value: 5,
            },
            filters: [
              {
                operator: 'eq',
                dimension_label: 'Protocol',
                value: 'list protocols',
              },
            ],
          },
          'Bytes Downloaded': {
            label: 'Bytes Downloaded',
            timeGranularity: { unit: 'min', value: 5 },
            filters: [], // OR NO filters key (same result)
          },
        },
      };
      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });

});
