/**
 * @file Integration Tests for the CloudPulse DBaaS Alerts Detail Page.
 *
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
   alertFactory,
  databaseFactory,
  linodeFactory,
  regionFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';

import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetDatabases } from 'support/intercepts/databases';
import { Database } from '@linode/api-v4';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { formatDate } from 'src/utilities/formatDate';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

const mockAccount = accountFactory.build();
const mockDBaaSAlertDetails = alertFactory.build({
  id: 1001,
  created_by: 'user1',
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
  updated_by: 'user1',
  entity_ids: ['1', '2'],
});
const mockLinodeAlertDetails = alertFactory.build({
  id: 1002,
  created_by: 'user1',
  service_type: 'linode',
  severity: 1,
  status: 'enabled',
  type: 'system',
  updated_by: 'user1',
  entity_ids: ['3'],
});

const mockDBaaSRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const mockLinodeRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const databaseMock: Database = databaseFactory.build({
  label: 'alert-resource-1',
  id: 1,
  type: 'MySQL',
  region: mockDBaaSRegion.label,
  version: '1',
  status: 'active',
  cluster_size: 1,
  engine: 'mysql',
});
const extendedDatabaseMock: Database = databaseFactory.build({
  label: 'alert-resource-2',
  id: 2,
  type: 'MySQL',
  region: mockDBaaSRegion.label,
  version: '1',
  status: 'active',
  cluster_size: 1,
  engine: 'mysql',
});
const mockLinode = linodeFactory.build({
  tags: ['tag-2', 'tag-3'],
  label: 'alert-resource-3',
  id: 3,
});

/**
 * Integration tests for the CloudPulse DBaaS Alerts Detail Page, ensuring that the alert details, criteria, and resource information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Dbaas Alert Show Detail Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions([mockDBaaSRegion, mockLinodeRegion]);
    mockGetAllAlertDefinitions([mockDBaaSAlertDetails,mockLinodeAlertDetails])
      .as('getAlertDefinitionsList');
    mockGetDatabases([databaseMock, extendedDatabaseMock])
    .as('getMockedDbaasDatabases');
    mockGetLinodes([mockLinode]).as('getLiodeDatabase');
    mockGetAlertDefinitions(
      mockDBaaSAlertDetails.service_type,
      mockDBaaSAlertDetails.id,
      mockDBaaSAlertDetails
    ).as('getDBaaSAlertDefinitions');
    mockGetAlertDefinitions(
      mockLinodeAlertDetails.service_type,
      mockLinodeAlertDetails.id,
      mockLinodeAlertDetails
    ).as('getLinodeAlertDefinitions');
    cy.visitWithLogin('/monitor/alerts/definitions');

    cy.wait('@getAlertDefinitionsList');

    cy.get(`[data-qa-alert-cell="${mockDBaaSAlertDetails.id}"]`)
     .within(() => {
    // Ensure the alert label is visible
    cy.findByText(mockDBaaSAlertDetails.label)
      .should('be.visible');

    // Action button within the alert cell should be visible and clickable
    cy.get(`[data-qa-alert-action-cell="alert_${mockDBaaSAlertDetails.id}"]`)
      .find('button') 
      .should('be.visible')
      .click();
  });

      cy.get('[data-qa-action-menu-item="Show Details"]')
      .should('be.visible')
      .click();

    cy.wait(['@getDBaaSAlertDefinitions', '@getMockedDbaasDatabases']);
  });

  it('should correctly display the details of the DBaaS alert in the alert details view', () => {
    cy.get('[data-qa-section="Overview"]').within(() => {
      // Validate Name field
      cy.get('[data-qa-item="Name"]').within(() => {
        cy.findByText('Name:').should('be.visible');
        cy.findByText(mockDBaaSAlertDetails.label).should('be.visible');
      });
      // Validate Description field
      cy.get('[data-qa-item="Description"]').within(() => {
        cy.findByText('Description:').should('be.visible');
        cy.findByText(mockDBaaSAlertDetails.description).should('be.visible');
      });

      // Validate Status field
      cy.get('[data-qa-item="Status"]').within(() => {
        cy.findByText('Status:').should('be.visible');
        cy.findByText( mockDBaaSAlertDetails.status.replace('enabled', 'Enabled') )
        .should('be.visible');
      });

      cy.get('[data-qa-item="Severity"]').within(() => {
        cy.findByText('Severity:').should('be.visible');
        cy.findByText(String(mockDBaaSAlertDetails.severity).replace('1', 'Medium')
         ).should('be.visible');
      });
      // Validate Service field
      cy.get('[data-qa-item="Service"]').within(() => {
        cy.findByText('Service:').should('be.visible');
        cy.findByText( mockDBaaSAlertDetails.service_type.replace('dbaas', 'Databases'))
        .should('be.visible');
      });

      // Validate Type field
      cy.get('[data-qa-item="Type"]').within(() => {
        cy.findByText('Type:')
         .should('be.visible');

        cy.findByText( mockDBaaSAlertDetails.type.replace('system', 'System'))
        .should('be.visible');
      });

      // Validate Created By field
      cy.get('[data-qa-item="Created By"]').within(() => {

        cy.findByText('Created By:')
        .should('be.visible');

        cy.findByText(mockDBaaSAlertDetails.created_by)
        .should('be.visible');
      });

      // Validate Last Modified field
      cy.get('[data-qa-item="Last Modified"]').within(() => {
        cy.findByText('Last Modified:')
           .should('be.visible');
        cy.findByText(formatDate(mockDBaaSAlertDetails.updated, {format: 'MMM dd, yyyy, h:mm a',}))
        .should('be.visible');
      });
    });

    cy.get('[data-qa-section="Criteria"]').within(() => {
      mockDBaaSAlertDetails.rule_criteria.rules.forEach((rule, index) => {
        cy.get('[data-qa-item="Metric Threshold"]')
          .eq(index)
          .within(() => {
            cy.get(`[data-qa-chip="${rule.aggregation_type.replace('avg', 'Average')}"]` )
              .should('be.visible')
              .should( 'have.text', rule.aggregation_type.replace('avg', 'Average'));

            cy.get(`[data-qa-chip="${rule.metric}"]`)
              .should('be.visible')
              .should('have.text', rule.metric);

            cy.get(`[data-qa-chip="${rule.operator.replace('gt', '>')}"]`)
              .should('be.visible')
              .should('have.text', rule.operator.replace('gt', '>'));

            cy.get(`[data-qa-chip="${rule.threshold}"]`)
              .should('be.visible')
              .should('have.text', rule.threshold);

            cy.get(`[data-qa-chip="${rule.unit}"]`)
              .should('be.visible')
              .should('have.text', rule.unit);
          });
        cy.get('[data-qa-item="Dimension Filter"]')
          .eq(index)
          .within(() => {
            (rule.dimension_filters ?? []).forEach((filter, filterIndex) => {
              // Validate the filter label
              cy.get(`[data-qa-chip="${filter.label}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.label);
                });
               // Validate the filter operator
              cy.get(`[data-qa-chip="${filter.operator}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.operator);
                });
                 // Validate the filter value
              cy.get(`[data-qa-chip="${filter.value}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.value);
                });
            });
          });
      });
    });
// Get the element with data-qa-item="Polling Interval", find the child chip element, and assert its visibility and text
    cy.get('[data-qa-item="Polling Interval"]')
      .find('[data-qa-chip]')
      .should('be.visible')
      .should( 'have.text', String(mockDBaaSAlertDetails.trigger_conditions.polling_interval_seconds)
      .replace('120', '2 minutes') );

   // Get the element with data-qa-item="Evaluation Periods", find the child chip element, and assert its visibility and text   
    cy.get('[data-qa-item="Evaluation Periods"]')
      .find('[data-qa-chip]')
       .should('be.visible') 
.       should('have.text', String(mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds) 
      .replace('240', '4 minutes')); 


    cy.get( `[data-qa-chip="${mockDBaaSAlertDetails.trigger_conditions.criteria_condition
      .replace('ALL', 'All')}"]` )
      .should('be.visible')
      .should('have.text',mockDBaaSAlertDetails.trigger_conditions.criteria_condition
        .replace( 'ALL', 'All' ) );

    cy.get(`[data-qa-chip="${String(mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds)
      .replace('240', '4 minutes')}"]` )
      .should('be.visible')
      .should( 'have.text', String( mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds)
      .replace('240', '4 minutes'));

    cy.get('[data-qa-item="criteria are met for"]').should('be.visible');

    cy.get('[data-qa-item="consecutive occurrences"]').should('be.visible');

   // Assert that the header with data-qa-header="resource" is visible and contains the correct text "Resource"
     cy.get('[data-qa-header="resource"]')
      .should('be.visible')
      .should('have.text', 'Resource');

   // Assert that the header with data-qa-header="region" is visible and contains the correct text "Region"
      cy.get('[data-qa-header="region"]')
      .should('be.visible')
      .should('have.text', 'Region');

    // Assert the placeholder value of the first input field (Search for a Resource)
    cy.findByPlaceholderText('Search for a Resource').should('be.visible');

    // Assert the placeholder value of the second input field (Select Regions)
    cy.findByPlaceholderText('Select Regions').should('be.visible');

    // Get all elements with the attribute 'data-qa-alert-row' and assert that the number of rows is 2
       cy.get('[data-qa-alert-row]')
      .should('have.length', 2);

// Assert that the cell for the resource corresponding to databaseMock is visible and contains the correct label text
cy.get(`[data-qa-alert-cell="${databaseMock.id}_resource"]`)
  .should('be.visible') 
  .should('have.text', databaseMock.label);

// Assert that the cell for the region corresponding to databaseMock is visible and contains the correct label text
cy.get(`[data-qa-alert-cell="${databaseMock.id}_region"]`)
  .should('be.visible') 
  .should('have.text', mockDBaaSRegion.label);

// Assert that the cell for the resource corresponding to extendedDatabaseMock is visible and contains the correct label text
cy.get(`[data-qa-alert-cell="${extendedDatabaseMock.id}_resource"]`)
  .should('be.visible') 
  .should('have.text', extendedDatabaseMock.label); 

// Assert that the cell for the region corresponding to databaseMock is visible and contains the correct label text
cy.get(`[data-qa-alert-cell="${databaseMock.id}_region"]`)
  .should('be.visible')
  .should('have.text', mockDBaaSRegion.label); 

  });
})
