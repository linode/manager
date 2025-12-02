/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 */
import {
  linodeFactory,
  profileFactory,
  regionFactory,
} from '@linode/utilities';
import { statusMap } from 'support/constants/alert';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServiceByType,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetBuckets,
  mockGetObjectStorageEndpoints,
} from 'support/intercepts/object-storage';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  dashboardMetricFactory,
  databaseFactory,
  flagsFactory,
  metricBuilder,
  notificationChannelFactory,
  objectStorageBucketFactory,
  objectStorageEndpointsFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
} from 'src/factories';
import { CREATE_ALERT_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { entityGroupingOptions } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type {
  AlertDefinitionMetricCriteria,
  DimensionFilter,
  Linode,
  ObjectStorageEndpoint,
} from '@linode/api-v4';

export interface MetricDetails {
  aggregationType: string;
  dataField: string;
  operator: string;
  ruleIndex: number;
  threshold: string;
}
// Create mock data
const mockAccount = accountFactory.build();
const { metrics, serviceType } = widgetDetails.objectstorage;
const regionList = ['us-ord', 'us-east'];

const databaseMock = regionList.map((region) =>
  databaseFactory.build({
    engine: 'mysql',
    region,
  })
);

const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  id: 1,
  label: 'channel-1',
  type: 'user',
});
const mockRegion = regionFactory.build({
  capabilities: ['Object Storage'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    metrics: ['Object Storage'],
    alerts: ['Object Storage'],
  },
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

// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);
const mockProfile = profileFactory.build({
  timezone: 'utc',
});
const mockAlerts = alertFactory.build({
  label: 'Alert-1',
  service_type: 'objectstorage',
  entity_ids: ['2'],
});

const CREATE_ALERT_PAGE_URL = '/alerts/definitions/create';
/**
 * Fills metric details in the form.
 * @param ruleIndex - The index of the rule to fill.
 * @param dataField - The metric's data field (e.g., "CPU Utilization").
 * @param aggregationType - The aggregation type (e.g., "Average").
 * @param operator - The operator (e.g., ">=", "==").
 * @param threshold - The threshold value for the metric.
 */
const fillMetricDetailsForSpecificRule = ({
  aggregationType,
  dataField,
  operator,
  ruleIndex,
  threshold,
}: MetricDetails) => {
  cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
    // Fill Data Field
    ui.autocomplete
      .findByLabel('Data Field')
      .should('be.visible')
      .type(dataField);

    ui.autocompletePopper.findByTitle(dataField).should('be.visible').click();

    // Validate Aggregation Type
    ui.autocomplete
      .findByLabel('Aggregation Type')
      .should('be.visible')
      .type(aggregationType);

    ui.autocompletePopper
      .findByTitle(aggregationType)
      .should('be.visible')
      .click();

    // Fill Operator
    ui.autocomplete.findByLabel('Operator').should('be.visible').type(operator);

    ui.autocompletePopper.findByTitle(operator).should('be.visible').click();

    // Fill Threshold
    cy.get('[data-qa-threshold]').should('be.visible').clear();
    cy.get('[data-qa-threshold]').should('be.visible').type(threshold);
  });
};
/**
 * Verifies that a specific alert row in the alert definitions table is correctly displayed.
 *
 * This function locates the row by the given alert label, then asserts the presence and
 * visibility of key values including the status (mapped through `statusMap`), service type,
 * creator, and the formatted update date.
 *
 * @param label - The label of the alert to find in the table.
 * @param status - The raw status key to be mapped using `statusMap`.
 * @param statusMap - A mapping of raw status keys to human-readable status strings.
 * @param createdBy - The username of the user who created the alert.
 * @param updated - The ISO timestamp string indicating when the alert was last updated.
 */
const verifyAlertRow = (
  label: string,
  status: string,
  statusMap: Record<string, string>,
  createdBy: string,
  updated: string
) => {
  cy.findByText(label)
    .closest('tr')
    .should('exist')
    .then(($row) => {
      cy.wrap($row).within(() => {
        cy.findByText(label).should('be.visible');
        cy.findByText(statusMap[status]).should('be.visible');
        cy.findByText('Object Storage').should('be.visible');
        cy.findByText(createdBy).should('be.visible');
        cy.findByText(
          formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: 'GMT',
          })
        ).should('be.visible');
      });
    });
};

const mockLinodes: Linode[] = [
  linodeFactory.build({
    id: 1,
    label: 'Linode 1',
    region: 'us-ord',
  }),
];

describe('object storage alert configured successfully', () => {
  /*
   * - Confirms that users can navigate from the Alert Listings page to the Create Alert page.
   * - Confirms that users can enter alert details, select entities, and configure conditions.
   * - Confirms that the UI allows adding notification channels and setting thresholds.
   * - Confirms client-side validation when entering invalid metric values.
   * - Confirms that API interactions work correctly and return the expected responses.
   * - Confirms that the UI displays a success message after creating an alert.
   */
  // entityScopingOptions is an array of predefined scoping strategies for alert definitions.
  // Each item in the array represents a way to scope entities when generating or organizing alerts.
  // The scoping strategies include 'Per Account', 'Per Entity'.
  // Temporary: Only testing entity-level for Object Storage alerts.
  // Once account-level is supported, remove `value === 'entity'` condition.
  const endpoints = [
    'endpoint_type-E2-us-sea-2.linodeobjects.com',
    'endpoint_type-E3-us-sea-3.linodeobjects.com',
    'endpoint_type-E2-us-sea-4.linodeobjects.com',
  ];
  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`should successfully create a new alert for ${groupLabel} level`, () => {
      const alerts = alertFactory.build({
        alert_channels: [{ id: 1 }],
        created_by: 'user1',
        description: 'My Custom Description',
        label: 'Alert-1',
        entity_ids: ['2'],
        rule_criteria: {
          rules: [
            metricBuilder.build({
              metric: 'obj_requests_num',
              dimension_filters: [
                {
                  dimension_label: 'region',
                  operator: 'eq',
                  value: 'Chicago, IL',
                },
                {
                  dimension_label: 'endpoint',
                  operator: 'eq',
                  value: 'endpoint_type-E2-us-sea-4.linodeobjects.com',
                },
                {
                  dimension_label: 'endpoint',
                  operator: 'in',
                  value: endpoints.join(','), // joined list of endpoints
                },
              ],
            }),
          ],
        },
        service_type: 'objectstorage',
        severity: 0,
        tags: [''],
        trigger_conditions: triggerConditionFactory.build(),
        scope: value,
        ...(value === 'region' ? { regions: regionList } : {}),
      });
      const services = serviceTypesFactory.build({
        service_type: 'objectstorage',
        label: serviceType,
        alert: serviceAlertFactory.build({
          evaluation_period_seconds: [300],
          polling_interval_seconds: [300],
          scope: [value],
        }),
        regions: 'us-ord',
      });
      const { created_by, status, updated } = mockAlerts;

      mockAppendFeatureFlags(flagsFactory.build());
      mockGetAccount(mockAccount);
      mockGetProfile(mockProfile);
      mockGetCloudPulseServices([serviceType]);
      mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
      mockGetDatabases(databaseMock);
      mockGetAllAlertDefinitions([alerts]).as('getAlertDefinitionsList');
      mockGetAlertChannels([notificationChannels]);
      mockGetLinodes(mockLinodes);
      mockGetCloudPulseServiceByType(serviceType, services);
      mockCreateAlertDefinition(serviceType, alerts).as(
        'createAlertDefinition'
      );
      mockGetRegions([mockRegion]);
      mockGetObjectStorageEndpoints(mockEndpoints).as(
        'getObjectStorageEndpoints'
      );
      mockGetBuckets(bucketMock).as('getBuckets');

      cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
      // Fill in Name and Description
      cy.findByPlaceholderText('Enter a Name').type(alerts.label);
      cy.findByPlaceholderText('Enter a Description').type(
        alerts.description || ''
      );

      // Fill in Service and Severity
      ui.autocomplete.findByLabel('Service').type('Object Storage');
      ui.autocompletePopper.findByTitle('Object Storage').click();
      ui.tooltip.findByText(
        'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.'
      );

      ui.autocomplete.findByLabel('Severity').type('Severe');
      ui.autocompletePopper.findByTitle('Severe').click();

      ui.tooltip.findByText(
        'The set of entities to which the alert applies: account-wide, specific regions, or individual entities.'
      );

      ui.autocomplete
        .findByLabel('Scope')
        .should('be.visible')
        .clear()
        .type(groupLabel);

      ui.autocompletePopper
        .findByTitle(groupLabel)
        .should('be.visible')
        .click();

      groupLabel !== 'Account' &&
        cy.get('[data-testid="select_all_notice"]').click();
      // Fill metric details for the first rule
      const allRequestsMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'All Requests',
        operator: '=',
        ruleIndex: 0,
        threshold: '1000',
      };

      fillMetricDetailsForSpecificRule(allRequestsMetricDetails);

      // Add metrics
      cy.findByRole('button', { name: 'Add metric' })
        .should('be.visible')
        .click();

      ui.buttonGroup
        .findButtonByTitle('Add dimension filter')
        .should('be.visible')
        .click();

      ui.autocomplete
        .findByLabel('Data Field')
        .should('be.visible')
        .eq(1)
        .type('Region');

      ui.autocompletePopper.findByTitle('Region').should('be.visible').click();

      ui.autocomplete
        .findByLabel('Operator')
        .eq(1)
        .should('be.visible')
        .clear();

      ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');

      cy.findByText('Equal').should('be.visible').click();

      cy.findByPlaceholderText('Enter a Value')
        .should('be.visible')
        .type('Chicago, IL');

      ui.buttonGroup
        .findButtonByTitle('Add dimension filter')
        .should('be.visible')
        .click();

      // IN operator flow
      ui.autocomplete
        .findByLabel('Data Field')
        .eq(2)
        .should('be.visible')
        .clear();

      ui.autocomplete
        .findByLabel('Data Field')
        .should('be.visible')
        .eq(2)
        .type('endpoint');

      cy.findByText('endpoint').should('be.visible').click();
      ui.autocomplete.findByLabel('Operator').eq(2).type('In');

      cy.findByText('In').should('be.visible').click();

      ui.autocomplete.findByLabel('Value').click();

      ui.autocomplete
        .findByLabel('Value')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
        .type('Select All');

      ui.autocompletePopper.findByTitle('Select All').click();

      // Equal operator flow

      ui.buttonGroup
        .findButtonByTitle('Add dimension filter')
        .should('be.visible')
        .click();

      ui.autocomplete
        .findByLabel('Data Field')
        .eq(3)
        .should('be.visible')
        .clear();

      ui.autocomplete
        .findByLabel('Data Field')
        .should('be.visible')
        .eq(3)
        .type('endpoint');

      cy.findByText('endpoint').should('be.visible').click();
      ui.autocomplete.findByLabel('Operator').eq(3).type('Equal');

      cy.findByText('Equal').should('be.visible').click();

      // Alias the input
      cy.get('input[placeholder="Select a Value"]')
        .should('be.visible')
        .as('valueInput');

      // Click and type with Enter
      cy.get('@valueInput').click();

      cy.get('@valueInput').type(
        'endpoint_type-E2-us-sea-4.linodeobjects.com{enter}'
      );

      // Wait for the autocomplete list to appear and click the matching option
      cy.get('[data-qa-option]')
        .contains('endpoint_type-E2-us-sea-4.linodeobjects.com')
        .click();

      // Fill metric details for the second rule

      const totalBucketSizeMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'Total Bucket Size',
        operator: '=',
        ruleIndex: 1,
        threshold: '1000',
      };

      fillMetricDetailsForSpecificRule(totalBucketSizeMetricDetails);

      // Set evaluation period
      ui.autocomplete
        .findByLabel('Evaluation Period')
        .should('be.visible')
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();

      // Set polling interval
      ui.autocomplete
        .findByLabel('Polling Interval')
        .should('be.visible')
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();

      // Set trigger occurrences
      cy.get('[data-qa-trigger-occurrences]').should('be.visible').clear();

      cy.get('[data-qa-trigger-occurrences]').should('be.visible').type('5');

      // Add notification channel
      ui.buttonGroup.find().contains('Add notification channel').click();

      ui.autocomplete.findByLabel('Type').should('be.visible').type('Email');
      ui.autocompletePopper.findByTitle('Email').should('be.visible').click();

      ui.autocomplete
        .findByLabel('Channel')
        .should('be.visible')
        .type('channel-1');

      ui.autocompletePopper
        .findByTitle('channel-1')
        .should('be.visible')
        .click();

      // Add channel
      ui.drawer
        .findByTitle('Add Notification Channel')
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Add channel')
            .should('be.visible')
            .click();
        });
      // Click on submit button
      ui.buttonGroup
        .find()
        .find('button')
        .filter('[type="submit"]')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@createAlertDefinition').then(({ request, response }) => {
        const reqBody = request.body;
        const resBody = response?.body;

        // --- Sanity Checks ---
        expect(resBody).to.have.property('id');
        expect(resBody).to.have.property('label', reqBody.label);
        expect(resBody).to.have.property('service_type', 'objectstorage');
        expect(resBody).to.have.property('status', 'enabled');
        expect(resBody).to.have.property('severity', reqBody.severity);

        // --- Compare Rule Criteria ---
        const reqRules = reqBody.rule_criteria.rules;
        const resRules = resBody.rule_criteria.rules;

        resRules.forEach(
          (rule: AlertDefinitionMetricCriteria, index: number) => {
            const reqRule = reqRules[index];

            // ✅ Basic field checks
            expect(rule.metric, `Metric mismatch at rule[${index}]`).to.eq(
              reqRule.metric
            );
            expect(rule.operator, `Operator mismatch at rule[${index}]`).to.eq(
              reqRule.operator
            );
            expect(
              rule.aggregate_function,
              `Aggregate function mismatch at rule[${index}]`
            ).to.eq(reqRule.aggregate_function);
            expect(
              rule.threshold,
              `Threshold mismatch at rule[${index}]`
            ).to.eq(reqRule.threshold);

            // ✅ Validate dimension_filters
            expect(
              rule.dimension_filters,
              `rule[${index}] dimension_filters should exist`
            ).to.exist;
            expect(
              rule.dimension_filters,
              `rule[${index}] dimension_filters should be an array`
            ).to.be.an('array').that.is.not.empty;

            const resFilters = rule.dimension_filters ?? [];
            const reqFilters = reqRule.dimension_filters ?? [];

            resFilters.forEach((filter: DimensionFilter) => {
              const matchingReqFilter = reqFilters.find(
                (f: DimensionFilter) =>
                  f.dimension_label === filter.dimension_label &&
                  f.operator === filter.operator
              );

              expect(
                matchingReqFilter,
                `No matching request filter found for label '${filter.dimension_label}' and operator '${filter.operator}'`
              ).to.exist;

              if (matchingReqFilter) {
                if (filter.operator?.toLowerCase() === 'in') {
                  // ✅ Handle 'in' operator as array comparison
                  const resValues: string[] = Array.isArray(filter.value)
                    ? filter.value
                    : (filter.value as string).split(',').map((v) => v.trim());

                  const reqValues: string[] = Array.isArray(
                    matchingReqFilter.value
                  )
                    ? matchingReqFilter.value
                    : (matchingReqFilter.value as string)
                      .split(',')
                      .map((v) => v.trim());

                  reqValues.forEach((v: string) => {
                    expect(
                      resValues,
                      `Value '${v}' from request filter '${filter.dimension_label}' not found in response`
                    ).to.include(v);
                  });
                } else {
                  // For other operators, assert equality
                  expect(
                    filter.value,
                    `Value mismatch for filter '${filter.dimension_label}' and operator '${filter.operator}'`
                  ).to.eq(matchingReqFilter.value);
                }
              }
            });

            // ✅ Optional: verify dimension labels and operators only (ignore value for order issues)
            const sortedResFilters = [...resFilters].sort(
              (a, b) =>
                a.dimension_label.localeCompare(b.dimension_label) ||
                a.operator.localeCompare(b.operator)
            );
            const sortedReqFilters = [...reqFilters].sort(
              (a, b) =>
                a.dimension_label.localeCompare(b.dimension_label) ||
                a.operator.localeCompare(b.operator)
            );
            expect(
              sortedResFilters.map((f) => ({
                label: f.dimension_label,
                op: f.operator,
              })),
              `Dimension labels/operators mismatch at rule[${index}]`
            ).to.deep.eq(
              sortedReqFilters.map((f) => ({
                label: f.dimension_label,
                op: f.operator,
              }))
            );

            // --- Compare Other Metadata ---
            expect(resBody.label).to.eq(reqBody.label);
            expect(resBody.class).to.eq('dedicated');
            expect(resBody.service_type).to.eq('objectstorage');
            expect(resBody.entity_ids).to.deep.eq(['2']);
            expect(resBody.scope).to.eq(reqBody.scope);

            cy.url().should('endWith', '/alerts/definitions');
            ui.toast.assertMessage(CREATE_ALERT_SUCCESS_MESSAGE);
            verifyAlertRow('Alert-1', status, statusMap, created_by, updated);
          }
        );
      });
    });
  });
});
