/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * are correctly displayed and interactive on the Edit page. It ensures that users can navigate
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  cpuRulesFactory,
  dashboardMetricFactory,
  databaseFactory,
  memoryRulesFactory,
  notificationChannelFactory,
  regionFactory,
  triggerConditionFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';
import {
    mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetRegions } from 'support/intercepts/regions';
import { Database } from '@linode/api-v4';
import { mockGetDatabases } from 'support/intercepts/databases';
import { widgetDetails } from 'support/constants/widgets';


const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };
const mockAccount = accountFactory.build();

const customAlertDefinition = alertDefinitionFactory.build({
    channel_ids: [1],
    label: 'Alert-1',
    severity: 0,
    description: 'My Custom Description',
    entity_ids: ['2'],
    tags: [''],
    rule_criteria: {
      rules: [cpuRulesFactory.build(),memoryRulesFactory.build({
        dimension_filters: [
          {
            dimension_label: 'state',
            operator: 'eq',
            value: 'user',
          },
        ],
      }),
      ],
    },
    trigger_conditions: triggerConditionFactory.build(),
  });


const alertDetails = alertFactory.build({
    service_type: 'dbaas',
    alert_channels: [{ id: 1 }],
    label: 'Alert-1',
    type:'user',
    severity: 0,
    description: 'My Custom Description',
    entity_ids: ['2'],
    updated: new Date().toISOString(),
    created_by: 'user1',
    tags: [''],
    rule_criteria: {
        rules: [cpuRulesFactory.build(),memoryRulesFactory.build({
          dimension_filters: [
            {
              dimension_label: 'state',
              operator: 'eq',
              value: 'user',
            },
          ],
        }),
        ],
      },
      trigger_conditions: triggerConditionFactory.build(),
    });
  
const { service_type, id } = alertDetails;
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-east',
    label: 'Newark',
  }),
];
const databases: Database[] = databaseFactory
  .buildList(5)
  .map((db, index) => ({
    ...db,
    type: 'MySQL',
    region: regions[index % regions.length].id,
    status: 'active',
    engine: 'mysql',
    id: index,  
  }));

  const { metrics} = widgetDetails.dbaas;
  const metricDefinitions = metrics.map(({ title, name, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
    })
  );
  const notificationChannels = notificationChannelFactory.build({
    channel_type: 'email',
    type: 'custom',
    label: 'channel-1',
    id: 1,
  });
  const {
    label,
    description,
  } = alertDetails;


describe('Integration Tests for Edit Alert', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions(regions);
    mockGetCloudPulseServices([alertDetails.service_type]);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockGetDatabases(databases).as('getDatabases');
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    mockCreateAlertDefinition(service_type, customAlertDefinition);
    mockGetAlertDefinitions(service_type, id, alertDetails).as('getAlertDefinitions');
    mockGetCloudPulseMetricDefinitions(service_type, metricDefinitions);
    mockGetAlertChannels([notificationChannels]);
});

const assertRuleValues = (
    ruleIndex: number, 
    dataFieldValue: string, 
    aggregationTypeValue: string, 
    operatorValue: string, 
    thresholdValue: string, 
    dimensionFieldValue: string, 
    dimensionOperatorValue: string, 
    dimensionValue: string
  ) => {
    cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
      // Assert Data Field
      cy.get(`[data-qa-metric-threshold="rule_criteria.rules.${ruleIndex}-data-field"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', dataFieldValue);
  
      // Assert Aggregation Type
      cy.get(`[data-qa-metric-threshold="rule_criteria.rules.${ruleIndex}-aggregation-type"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', aggregationTypeValue);
  
      // Assert Operator
      cy.get(`[data-qa-metric-threshold="rule_criteria.rules.${ruleIndex}-operator"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', operatorValue);
  
      // Assert Threshold
      cy.get(`[data-qa-metric-threshold="rule_criteria.rules.${ruleIndex}-threshold"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', thresholdValue);
  
      // Assert Dimension Filter Data Field
      cy.get(`[data-qa-dimension-filter="rule_criteria.rules.${ruleIndex}.dimension_filters.0-data-field"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', dimensionFieldValue);
  
      // Assert Dimension Filter Operator
      cy.get(`[data-qa-dimension-filter="rule_criteria.rules.${ruleIndex}.dimension_filters.0-operator"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', dimensionOperatorValue);
  
      // Assert Dimension Filter Value
      cy.get(`[data-qa-dimension-filter="rule_criteria.rules.${ruleIndex}.dimension_filters.0-value"]`)
        .should('be.visible')
        .find('input')
        .should('have.value', dimensionValue);
    });
  };
  

it('should correctly display  the details of the alert in the edit alert page', () => { 
    
    cy.visitWithLogin(`/monitor/alerts/definitions/edit/${service_type}/${id}`);
    cy.wait('@getAlertDefinitions'); 

    cy.findByLabelText('Name').should('have.value', label);
    cy.findByLabelText('Description (optional)').should('have.value', description);  
    cy.findByLabelText('Service').should('be.disabled').should('have.value', 'Databases');
    cy.findByLabelText('Severity').should('have.value', 'Severe');

    cy.get('[data-qa-alert-table="true"]') // Find the table
      .contains('[data-qa-alert-cell*="resource"]', 'database-3') // Find resource cell
      .parents('tr')
      .find('[type="checkbox"]')
      .should('be.checked');

      cy.get('[data-qa-notice="true"]')
      .find('p')
      .should('have.text', '1 of 5 resources are selected.');

      assertRuleValues(
        0, 
        'CPU Utilization', 
        'Average',
        '==', 
        '1000',
        'State of CPU', 
        'Equal', 
        'User'
      );

      assertRuleValues(
        1,
        'Memory Usage',
        'Average',
        '==',
        '1000',
        'State of CPU', 
        'Equal', 
        'User' 
      );

      cy.get('[data-qa-section="Notification Channels"]').within(() => {
        cy.findByLabelText('Type:').should('be.visible');
        cy.findByText('Email').should('be.visible');
        cy.findByText('Channel:').should('be.visible');
        cy.findByText('Channel-1').should('be.visible');
        cy.findByText('To:').should('be.visible');
        cy.findByText('test@test.com').should('be.visible');
        cy.findByText('test2@test.com').should('be.visible');
      });
});
});



 

